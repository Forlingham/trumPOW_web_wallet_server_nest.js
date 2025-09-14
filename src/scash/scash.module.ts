import { Global, Module } from '@nestjs/common'
import { ScashService } from './scash.service'

@Global()
@Module({
  providers: [ScashService],
  exports: [ScashService]
})
export class ScashModule {}
