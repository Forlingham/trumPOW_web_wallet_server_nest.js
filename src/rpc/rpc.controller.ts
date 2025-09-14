import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { RpcService } from './rpc.service'
import { CreateRpcDto, SendRawTransactionDto } from './dto/create-rpc.dto'
import { UpdateRpcDto } from './dto/update-rpc.dto'

@Controller('rpc')
export class RpcController {
  constructor(private readonly rpcService: RpcService) {}

  @Post('onUserCreate')
  async onUserCreate(@Body('address') address: string) {
    return this.rpcService.onUserCreate(address)
  }

  @Post('getblockchaininfo')
  async getblockchaininfo() {
    return this.rpcService.getblockchaininfo()
  }

  @Post('gettransaction')
  async gettransaction(@Body('txid') txid: string) {
    return this.rpcService.gettransaction(txid)
  }

  @Post('getrawtransaction')
  async getrawtransaction(@Body('txid') txid: string) {
    return this.rpcService.getrawtransaction(txid)
  }

  @Post('scantxoutset')
  async scantxoutset(@Body('address') address: string) {
    return this.rpcService.scantxoutset(address)
  }

  @Post('estimatesmartfee')
  async estimatesmartfee() {
    return this.rpcService.estimatesmartfee()
  }

  @Post('broadcast')
  async broadcast(@Body() sendRawTransactionDto: SendRawTransactionDto) {
    return this.rpcService.broadcast(sendRawTransactionDto)
  }
}
