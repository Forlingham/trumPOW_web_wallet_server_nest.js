import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as bodyParser from 'body-parser'
import { AppModule } from './app.module'
import { ExceptionHttpFilter } from './common/exception/ExceptionHttp.filter'
import { ApiLoggingInterceptor } from './common/interceptor/ApiLogging.interceptor'
import { ResponseHttpInterceptor } from './common/interceptor/ResponseHttp.interceptor'
import ValidatePipe from './common/pipe/Validate.pipe'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.useGlobalPipes(new ValidatePipe())
  app.useGlobalInterceptors(new ResponseHttpInterceptor())
  app.useGlobalInterceptors(new ApiLoggingInterceptor())
  app.useGlobalFilters(new ExceptionHttpFilter())
  app.setGlobalPrefix('api')
  app.set('trust proxy', true)
  // 增加请求体大小限制
  app.use(bodyParser.json({ limit: '10mb' })) // 根据需要调整大小
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })) // 根据需要调整大小
  await app.listen(7050)
}
bootstrap()
