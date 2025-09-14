import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { ValidateException } from './validateDto.exception'
import { Prisma } from '@prisma/client'
import { encryptAES_Hex } from 'src/tool/cryoto'
import { MuExceptions205, MuExceptions205NoEncrypted } from '../MuExceptions205'

@Catch(Error)
export class ExceptionHttpFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const iv = Date.now() + ''
    response.header('time', iv)

    if (exception instanceof ValidateException) {
      console.log('字段验证错误', exception)
      const code = HttpStatus.UNPROCESSABLE_ENTITY

      const res = {
        code,
        data: exception.getResponse(),
        message: 'field error'
      }

      return response.status(200).send(res)
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      console.log('prisma错误', exception)
      const code = HttpStatus.INTERNAL_SERVER_ERROR
      const res = {
        code,
        data: {},
        message: exception.message
      }
      return response.status(200).send(res)
    }

    if (exception instanceof MuExceptions205) {
      console.log('205 报错', exception)
      const code = 205
      const res = {
        code,
        data: {},
        message: exception.message
      }

      return response.status(200).send(res)
    }

    if (exception instanceof MuExceptions205NoEncrypted) {
      console.log('205 报错(未加密)', exception)
      const code = 205
      const res = {
        code,
        data: {},
        message: exception.message
      }
      return response.status(200).send(res)
    }

    console.log('全局错误', exception)
    const code = exception.getStatus ? exception.getStatus() : 500
    const res = {
      code,
      data: {},
      message: exception.message
    }

    return response.status(200).send(res)
  }
}
