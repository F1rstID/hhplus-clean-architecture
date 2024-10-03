import { BaseException } from './base.exception';
import { ErrorCode } from '../constants/error-code.enum';
import { HttpStatus } from '@nestjs/common';

export class LectureAlreadyRegisteredException extends BaseException {
  constructor() {
    super(
      '이미 등록된 특강입니다.',
      ErrorCode.LECTURE_ALREADY_REGISTERED,
      HttpStatus.CONFLICT,
    );
  }
}