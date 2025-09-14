// interceptor.ts
import { Injectable, NestInterceptor, CallHandler, Logger, ExecutionContext } from '@nestjs/common'
import { Observable, tap } from 'rxjs'

@Injectable()
export class ApiLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (process.env.IS_DEBUG === 'true') {
      const now = Date.now()
      const request = context.switchToHttp().getRequest() as Request
      const method = request.method
      const url = request.url

      const body = request.body || {}
      // @ts-ignore
      const query = request.query || {}
      // @ts-ignore
      const params = request.params || {}

      // @ts-ignore
      let clientIp = request.headers['x-forwarded-for'] || request.headers['x-real-ip'] || request.ip

      let ipv4 = ''
      if (Array.isArray(clientIp) && clientIp.length > 0) {
        clientIp = clientIp[0]
      } else {
        ipv4 = clientIp as string
      }

      Logger.debug(`${clientIp} ${method} ${url}`, 'ApiStart')
      const DEBUG_EXCLUDE_LOG_ARR = process.env.DEBUG_EXCLUDE_LOG.split(',')
      if (!DEBUG_EXCLUDE_LOG_ARR.includes(url)) {
        console.warn('query: ', JSON.stringify(query))
        console.warn('params: ', JSON.stringify(params))
        console.warn('body: ', JSON.stringify(body))
        console.log('\n')
      }

      return next.handle().pipe(
        // 请求结束后的操作
        tap(() => {
          Logger.debug(`${method} ${url} : ${Date.now() - now}ms`, 'ApiEnd')
          console.log('\n')
        })
      )
    } else {
      return next.handle()
    }
  }
}
