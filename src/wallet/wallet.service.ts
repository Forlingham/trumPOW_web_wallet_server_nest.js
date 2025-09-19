import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { BlockchainService } from '../blockchain/blockchain.service'
import { Decimal } from '@prisma/client/runtime/library'

// 定义详细交易的返回结构
export interface DetailedTransaction {
  txid: string
  timestamp: Date
  blockHeight: number
  type: 'send' | 'receive' | 'self' // 交易类型：支出、收款、发给自己
  amount: string // 净变化的金额（总是正数）
  counterparties: string[] // 对方地址列表
  confirmations: number
}

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainService
  ) {}

  /**
   * 获取单个地址的摘要信息
   * @param address 要查询的钱包地址
   */
  async getAddressSummary(address: string) {
    const balanceResult = await this.prisma.uTXO.aggregate({
      _sum: { amount: true },
      where: {
        address: address,
        isSpent: false
      }
    })

    const txCount = await this.prisma.transaction.count({
      where: { addresses: { some: { address: address } } }
    })

    return {
      address: address,
      balance: balanceResult._sum.amount || new Decimal(0),
      transactionCount: txCount
    }
  }

  /**
   * 获取单个地址的所有未花费 UTXO
   * @param address 要查询的钱包地址
   */
  async getAddressUtxos(address: string) {
    const utxos = await this.prisma.uTXO.findMany({
      where: {
        address: address,
        isSpent: false
      },
      select: {
        txid: true,
        vout: true,
        amount: true,
        scriptPubKey: true
      },

      orderBy: { createdAt: 'desc' }
    })

    // 要查询高度
    for (const utxo of utxos) {
      const tx = await this.prisma.transaction.findUnique({
        where: {
          txid: utxo.txid
        }
      })
      if (tx) {
        // @ts-ignore
        utxo.height = tx.blockHeight || 0
      }
    }

    // 查询当前高度
    const height = await await this.blockchainService.getBlockCount()

    return {
      rpcData: {
        success: true,
        txouts: 0,
        height: height,
        unspents: utxos,
        total_amount: utxos.reduce((acc, utxo) => acc.add(utxo.amount), new Decimal(0))
      },
      success: true
    }
  }

  /**
   * 获取地址的交易历史（支持分页和详情）
   * @param address 要查询的地址
   * @param page 页码
   * @param limit 每页数量
   * @param showDetails 是否查询详细信息
   */
  async getAddressTransactions(
    address: string,
    page: number,
    limit: number,
    showDetails: boolean,
    latestBlockHeight: number // 传入最新的区块高度以计算确认数
  ) {
    const skip = (page - 1) * limit

    // 1. 获取总数和当页的交易记录
    const [total, transactions] = await Promise.all([
      this.prisma.transaction.count({
        where: { addresses: { some: { address: address } } }
      }),
      this.prisma.transaction.findMany({
        where: { addresses: { some: { address: address } } },
        orderBy: { timestamp: 'desc' },
        skip: skip,
        take: limit
      })
    ])

    // 2. 如果不需要详情，直接返回
    if (!showDetails) {
      return {
        page,
        limit,
        total,
        data: transactions
      }
    }

    // 3. 如果需要详情，则进行复杂的处理
    const detailedData: DetailedTransaction[] = []
    for (const tx of transactions) {
      try {
        const detailedTx = await this.analyzeTransactionDetails(tx.txid, address, latestBlockHeight)
        detailedTx.timestamp = tx.timestamp // 使用我们数据库中更精确的时间
        detailedTx.blockHeight = tx.blockHeight
        detailedData.push(detailedTx)
      } catch (error) {
        console.error(`处理 txid ${tx.txid} 失败:`, error)
        // 如果单个交易处理失败，可以跳过或返回一个错误标记
      }
    }

    return {
      page,
      limit,
      total,
      data: detailedData
    }
  }

  /**
   * **[性能警告]**
   * 此方法会为每个输入进行一次额外的 RPC 调用来查找来源地址。
   * 在高负载下可能会很慢。生产环境建议优化数据库模式以存储输入的地址和金额。
   * @param txid 交易ID
   * @param perspectiveAddress 我们观察的地址
   * @param latestBlockHeight 当前链的最新高度
   */
  private async analyzeTransactionDetails(
    txid: string,
    perspectiveAddress: string,
    latestBlockHeight: number
  ): Promise<DetailedTransaction> {
    const rawTx = await this.blockchainService.getRawTransaction(txid)
    if (!rawTx) {
      throw new InternalServerErrorException(`无法获取交易详情: ${txid}`)
    }

    let totalOut = new Decimal(0)
    let totalIn = new Decimal(0)
    const outputAddresses = new Set<string>()
    const inputAddresses = new Set<string>()

    // 1. 遍历所有输出 (vout)
    for (const vout of rawTx.vout) {
      if (vout.scriptPubKey?.addresses) {
        // 如果输出地址包含我们的地址，则计入我们的收款总额
        if (vout.scriptPubKey.addresses.includes(perspectiveAddress)) {
          totalOut = totalOut.plus(vout.value)
        } else {
          // 否则，计入输出对手方
          vout.scriptPubKey.addresses.forEach((addr) => outputAddresses.add(addr))
        }
      }
    }

    // 2. 遍历所有输入 (vin)，这需要额外的RPC调用
    for (const vin of rawTx.vin) {
      if (vin.coinbase) continue

      const prevTx = await this.blockchainService.getRawTransaction(vin.txid)
      const spentVout = prevTx.vout[vin.vout]

      if (spentVout.scriptPubKey?.addresses) {
        // 如果输入的来源地址是我们的，则计入我们的付款总额
        if (spentVout.scriptPubKey.addresses.includes(perspectiveAddress)) {
          totalIn = totalIn.plus(spentVout.value)
        } else {
          // 否则，计入输入对手方
          spentVout.scriptPubKey.addresses.forEach((addr) => inputAddresses.add(addr))
        }
      }
    }

    // 3. 计算净额并判断交易类型
    const netAmount = totalOut.minus(totalIn)
    let type: DetailedTransaction['type'] = 'self'
    let counterparties: string[] = []

    if (netAmount.isPositive()) {
      // 净额为正，说明是收款
      type = 'receive'
      // 对手方是所有输入地址
      counterparties = Array.from(inputAddresses)
    } else if (netAmount.isNegative()) {
      // 净额为负，说明是付款
      type = 'send'
      // 对手方是所有我们没有收到的输出地址
      counterparties = Array.from(outputAddresses)
    } else {
      // 净额为零，可能是自己转自己，或作为中间人（例如混币）
      type = 'self'
      // 此时对手方可以是输入的并集或输出的并集，这里我们选择输出方
      counterparties = Array.from(outputAddresses)
    }

    const confirmations =
      rawTx.confirmations !== undefined ? rawTx.confirmations : rawTx.blockheight ? latestBlockHeight - rawTx.blockheight + 1 : 0

    return {
      txid: rawTx.txid,
      timestamp: new Date((rawTx.blocktime || rawTx.time) * 1000),
      blockHeight: rawTx.blockheight,
      type,
      amount: netAmount.abs().toString(),
      counterparties,
      confirmations: confirmations
    }
  }

  /**
   * 创建一个裸交易
   * @param inputs 输入的UTXO列表，每个UTXO包含txid和vout
   * @param outputs 输出的地址和金额，键为地址，值为金额
   * @returns 裸交易的16进制字符串
   */
  async createrawtransaction(inputs: { txid: string; vout: number }[], outputs: { [address: string]: number }) {
    const rawTxHex = await this.blockchainService.createrawtransaction(inputs, outputs)
    return {
      success: true,
      rpcData: {
        rawTxHex
      }
    }
  }

  /**
   * 广播一个已签名的裸交易
   * @param rawTxHex 16进制格式的裸交易字符串
   */
  async broadcastTransaction(rawTxHex: string): Promise<{ txid: string }> {
    const txid = await this.blockchainService.sendRawTransaction(rawTxHex)
    return { txid }
  }
}
