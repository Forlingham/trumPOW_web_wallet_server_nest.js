import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TimingService } from './timing.service';
import { CreateTimingDto } from './dto/create-timing.dto';
import { UpdateTimingDto } from './dto/update-timing.dto';

@Controller('timing')
export class TimingController {
  constructor(private readonly timingService: TimingService) {}

 
}
