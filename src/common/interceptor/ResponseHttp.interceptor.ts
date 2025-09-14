import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, map } from 'rxjs'

@Injectable()
export class ResponseHttpInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {


    return next.handle().pipe(
      map((data) => {
        BigInt.prototype['toJSON'] = function () {
          return this.toString()
        }

        const res = {
          data,
          code: 200,
          message: ''
        }

        return res
      })
    )
  }
}
