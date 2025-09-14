import { BadRequestException, HttpExceptionOptions } from '@nestjs/common'

export class ValidateException extends BadRequestException {
  constructor(objectOrError?: string | object | any, descriptionOrOptions?: string | HttpExceptionOptions) {
    super(objectOrError, descriptionOrOptions)
  }
}
