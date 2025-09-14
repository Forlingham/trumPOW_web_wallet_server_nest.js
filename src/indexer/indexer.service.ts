import { Injectable, OnModuleInit, Logger, OnModuleDestroy } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { BlockchainService } from '../blockchain/blockchain.service'
import { Decimal } from '@prisma/client/runtime/library'
import { Prisma } from '@prisma/client'

@Injectable()
export class IndexerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IndexerService.name)
  private isSyncing = false
  private timer: NodeJS.Timeout

  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainService
  ) {}

  async onModuleInit() {
    this.logger.log('索引器服务已启动。将在5秒后开始同步...')
    setTimeout(() => this.startSync(), 5000)
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  startSync() {
    if (this.timer) clearInterval(this.timer)
    this.timer = setInterval(() => this.syncBlocks(), 10000)
  }

  async syncBlocks() {
    if (this.isSyncing) return
    this.isSyncing = true
    this.logger.log('开始新一轮区块同步...')

    try {
      let state = await this.prisma.indexerState.findUnique({ where: { singleton: 'indexer' } })
      if (!state) {
        state = await this.prisma.indexerState.create({ data: { lastProcessedBlock: 0 } })
      }
      let lastProcessedBlock = state.lastProcessedBlock

      const latestBlockHeight = await this.blockchainService.getBlockCount()
      this.logger.log(`数据库高度: ${lastProcessedBlock}, 链上最新高度: ${latestBlockHeight}`)

      for (let height = lastProcessedBlock + 1; height <= latestBlockHeight; height++) {
        this.logger.log(`[Indexer] 正在处理区块: ${height}`)
        const blockHash = await this.blockchainService.getBlockHash(height)
        const block = await this.blockchainService.getBlock(blockHash)

        await this.prisma.$transaction(
          async (tx) => {
            // **优化点 1: 批量预查询已存在的交易**
            const txidsInBlock = block.tx.map((t) => t.txid)
            const existingTxs = await tx.transaction.findMany({
              where: { txid: { in: txidsInBlock } },
              select: { txid: true }
            })
            const existingTxids = new Set(existingTxs.map((t) => t.txid))

            // 筛选出需要处理的新交易
            const newTransactions = block.tx.filter((t) => !existingTxids.has(t.txid))
            this.logger.log(`区块 ${height} 中有 ${newTransactions.length} 条新交易需要处理。`)

            for (const txData of newTransactions) {
              await this.processTransaction(txData, block, tx)
            }

            // 更新索引高度
            await tx.indexerState.update({
              where: { singleton: 'indexer' },
              data: { lastProcessedBlock: height }
            })
          },
          { timeout: 180000 }
        ) // 事务超时时间延长至3分钟
      }
    } catch (error) {
      this.logger.error(`同步区块 ${error.height || ''} 时发生错误:`, error)
    } finally {
      this.isSyncing = false
      this.logger.log('本轮同步结束。')
    }
  }

  /**
   * [已优化] 处理单笔交易，使用 upsert 保证幂等性
   */
  private async processTransaction(
    txData: any,
    block: any,
    prisma: Prisma.TransactionClient // 使用事务客户端类型
  ) {
    const txid = txData.txid
    const allInvolvedAddresses = new Set<string>()

    // 1. 处理输入 (花掉 UTXO，并收集输入地址)
    for (const vin of txData.vin) {
      if (vin.coinbase) continue

      try {
        const prevTx = await this.blockchainService.getRawTransaction(vin.txid)
        const spentVout = prevTx.vout[vin.vout]
        if (spentVout.scriptPubKey?.addresses) {
          spentVout.scriptPubKey.addresses.forEach((addr) => allInvolvedAddresses.add(addr))
        }
      } catch (e) {
        this.logger.warn(`无法获取前序交易 ${vin.txid}，跳过输入地址索引。错误: ${e.message}`)
      }

      // **优化点 2: 使用 updateMany 仍然是最高效的方式**
      await prisma.uTXO.updateMany({
        where: { txid: vin.txid, vout: vin.vout },
        data: { isSpent: true }
      })
    }

    // 2. 处理输出 (创建新的 UTXO，并收集输出地址)
    for (const vout of txData.vout) {
      if (vout.scriptPubKey?.addresses) {
        vout.scriptPubKey.addresses.forEach((addr) => allInvolvedAddresses.add(addr))
      }
    }

    // 3. **优化点 3: 批量 `upsert` 所有涉及的地址**
    // 确保所有地址都存在于数据库中，如果不存在则创建。
    if (allInvolvedAddresses.size > 0) {
      for (const addr of allInvolvedAddresses) {
        await prisma.address.upsert({
          where: { address: addr },
          create: { address: addr },
          update: {}
        })
      }
    }

    // 4. 创建新的 UTXO
    for (const vout of txData.vout) {
      if (!vout.scriptPubKey?.addresses) continue

      for (const address of vout.scriptPubKey.addresses) {
        // **优化点 4: 使用 `upsert` 创建 UTXO，防止重复**
        await prisma.uTXO.upsert({
          where: { txid_vout: { txid: txid, vout: vout.n } },
          create: {
            txid,
            vout: vout.n,
            address,
            amount: new Decimal(vout.value),
            scriptPubKey: vout.scriptPubKey.hex
          },
          update: {} // 如果已存在，什么都不做
        })
      }
    }

    // 5. 创建交易记录，并关联所有涉及的地址
    if (allInvolvedAddresses.size > 0) {
      // 因为我们已经预筛选过，这里可以直接创建
      await prisma.transaction.create({
        data: {
          txid,
          blockHeight: block.height,
          blockHash: block.hash,
          timestamp: new Date(block.time * 1000),
          addresses: {
            connect: Array.from(allInvolvedAddresses).map((addr) => ({ address: addr }))
          }
        }
      })
    }
  }
}
