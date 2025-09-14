import { Body, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

import { ScashService } from 'src/scash/scash.service'
import { SendRawTransactionDto } from './dto/create-rpc.dto'

@Injectable()
export class RpcService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly scashService: ScashService
  ) {}

  async onUserCreate(address: string) {
    if (!address || address.length !== 45) {
      return {
        success: false,
        error: '地址不能为空'
      }
    }
    const user = await this.prismaService.db_userList.findFirst({
      where: {
        address: address
      }
    })
    if (user) {
      return {
        success: false,
        error: ''
      }
    }
    await this.prismaService.db_userList.create({
      data: {
        address: address
      }
    })

    return {
      success: true,
      rpcData: {} as any
    }
  }

  // 获取区块链信息
  async getblockchaininfo() {
    // const data = await this.scashService.getblockchaininfo()

    const data = {
      success: true,
      rpcData: {} as any
    }

    const rpcData = await this.prismaService.db_blockChainInfo.findFirst({
      orderBy: {
        id: 'desc'
      }
    })
    
    data.rpcData = rpcData

    try {
      const coinPriseData = await this.prismaService.db_coinPrise.findFirst({
        orderBy: {
          id: 'desc'
        }
      })
      data.rpcData.coinPrice = coinPriseData.price
    } catch (error) {
      data.rpcData.coinPrice = 0
    }

    return data
  }
  // 获取交易详情
  async gettransaction(txid: string) {
    const data = await this.scashService.gettransaction(txid)

    return data
  }

  // 获取交易详情
  async getrawtransaction(txid: string) {
    const data = await this.scashService.getrawtransaction(txid)

    return data
  }

  // 查询可用的交易
  async scantxoutset(address: string) {
    const data = await this.scashService.scantxoutset(address)

    return data
  }

  // 获取手续费
  async estimatesmartfee() {
    const data = await this.scashService.estimatesmartfee()

    return data
  }

  // 广播交易
  async broadcast(@Body() sendRawTransactionDto: SendRawTransactionDto) {
    const data = await this.scashService.broadcast(sendRawTransactionDto.rawtx)
    if (data.success) {
      await this.prismaService.db_sendRawTransaction.create({
        data: {
          address: sendRawTransactionDto.address,
          txid: data.rpcData.txid,
          rawtx: sendRawTransactionDto.rawtx,
          totalInput: sendRawTransactionDto.totalInput,
          totalOutput: sendRawTransactionDto.totalOutput,
          change: sendRawTransactionDto.change,
          feeRate: sendRawTransactionDto.feeRate,
          appFee: sendRawTransactionDto.appFee
        }
      })

      return {
        success: true,
        rpcData: data.rpcData
      }
    }

    return {
      success: false,
      error: data.error
    }
  }
}
