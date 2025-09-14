import { IsNotEmpty, Length } from 'class-validator'

export class CreateRpcDto {}

export class SendRawTransactionDto {
  @IsNotEmpty()
  @Length(34, 34)
  address: string
  txid: string
  @IsNotEmpty()
  @Length(100, 10000)
  rawtx: string
  @IsNotEmpty()
  totalInput: number
  @IsNotEmpty()
  totalOutput: number
  @IsNotEmpty()
  change: number
  @IsNotEmpty()
  feeRate: number
  @IsNotEmpty()
  appFee: number
}
