import { Injectable } from '@nestjs/common'
import { CreateTimingDto } from './dto/create-timing.dto'
import { UpdateTimingDto } from './dto/update-timing.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { Cron } from '@nestjs/schedule'
import { ScashService } from 'src/scash/scash.service'
import axios from 'axios'

@Injectable()
export class TimingService {
  constructor(
    private prismaService: PrismaService,
    private readonly scashService: ScashService
  ) {}

  // 定时获取区块链信息保存起来
  @Cron('*/10 * * * * *')
  async getBlockChainInfo() {
    const blockChainInfo = await this.scashService.getblockchaininfo()

    if (blockChainInfo.success) {
      try {
        const isHas = await this.prismaService.db_blockChainInfo.findFirst({
          where: {
            blocks: blockChainInfo.rpcData.blocks
          }
        })
        if (!isHas) {
          await this.prismaService.db_blockChainInfo.create({
            data: {
              chain: blockChainInfo.rpcData.chain,
              blocks: blockChainInfo.rpcData.blocks,
              headers: blockChainInfo.rpcData.headers,
              bestblockhash: blockChainInfo.rpcData.bestblockhash,
              difficulty: blockChainInfo.rpcData.difficulty,
              time: 0,
              mediantime: blockChainInfo.rpcData.mediantime,
              verificationprogress: blockChainInfo.rpcData.verificationprogress,
              initialblockdownload: blockChainInfo.rpcData.initialblockdownload,
              chainwork: blockChainInfo.rpcData.chainwork,
              size_on_disk: blockChainInfo.rpcData.size_on_disk,
              pruned: blockChainInfo.rpcData.pruned,
              warnings: blockChainInfo.rpcData.warnings
            }
          })
        }
      } catch (error) {
        console.log('获取区块链信息失败', error)
      }

      return {}
    }
  }

  // 每半个小时获取一次币价
  @Cron('0 */30 * * * *')
  async getPrice() {
    try {
      const url = 'https://explorer-1.trumpow.meme/ext/getsummary'
      const res = await axios.get(url)

      if (res.data) {
        await this.prismaService.db_coinPrise.create({
          data: {
            price: res.data['lastUSDPrice']
          }
        })
      }
    } catch (error) {
      console.log('获取币价失败')
    }
  }
}
