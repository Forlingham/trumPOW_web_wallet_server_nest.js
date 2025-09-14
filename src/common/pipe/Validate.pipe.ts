import { ValidationError, ValidationPipe } from '@nestjs/common'
import { ValidateException } from '../exception/validateDto.exception'

export default class ValidatePipe extends ValidationPipe {
  protected flattenValidationErrors(errors: ValidationError[]): string[] {
    const message = {}
    errors.forEach((err) => {
      message[err.property] = Object.values(err.constraints)
    })

    throw new ValidateException(message)
  }
}
