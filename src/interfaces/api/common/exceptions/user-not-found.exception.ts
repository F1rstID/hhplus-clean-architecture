import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../constants/error-code.enum';
import { BaseException } from './base.exception';

export class UserNotFoundException extends BaseException {
  constructor() {
    super(
      '존재하지 않는 사용자입니다.',
      ErrorCode.USER_NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }
}
