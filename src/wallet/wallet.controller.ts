import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ParseBoolPipe
} from '@nestjs/common'
import { WalletService } from './wallet.service'
import { BlockchainService } from 'src/blockchain/blockchain.service'

// DTO for broadcasting a transaction
class BroadcastTxDto {
  rawTxHex: string
}

@Controller('address') // 路由改为 /address
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly blockchainService: BlockchainService
  ) {}

  @Get(':address/summary')
  async getSummary(@Param('address') address: string) {
    const summary = await this.walletService.getAddressSummary(address)
    // 返回字符串以保证精度
    return {
      ...summary,
      balance: summary.balance.toString()
    }
  }

  @Get(':address/utxos')
  async getUtxos(@Param('address') address: string) {
    return this.walletService.getAddressUtxos(address)
  }

  @Get(':address/transactions')
  async getTransactions(
    @Param('address') address: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('details', new DefaultValuePipe(false), ParseBoolPipe) showDetails: boolean
  ) {
    // 获取最新区块高度以计算确认数
    const latestBlock = await this.blockchainService.getBlockCount()
    return this.walletService.getAddressTransactions(address, page, limit, showDetails, latestBlock)
  }

  @Post('/createrawtransaction')
  @HttpCode(HttpStatus.OK)
  async createrawtransaction(
    @Body() createrawtransactionDto: { inputs: { txid: string; vout: number }[]; outputs: { [address: string]: number } }
  ) {
    return this.walletService.createrawtransaction(createrawtransactionDto.inputs, createrawtransactionDto.outputs)
  }

  @Post('/broadcast')
  @HttpCode(HttpStatus.OK)
  async broadcastTransaction(@Body() broadcastTxDto: BroadcastTxDto) {
    return this.walletService.broadcastTransaction(broadcastTxDto.rawTxHex)
  }
}
