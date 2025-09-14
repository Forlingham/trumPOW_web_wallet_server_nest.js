import { PartialType } from '@nestjs/mapped-types';
import { CreateTimingDto } from './create-timing.dto';

export class UpdateTimingDto extends PartialType(CreateTimingDto) {}
