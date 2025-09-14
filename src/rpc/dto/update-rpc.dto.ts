import { PartialType } from '@nestjs/mapped-types';
import { CreateRpcDto } from './create-rpc.dto';

export class UpdateRpcDto extends PartialType(CreateRpcDto) {}
