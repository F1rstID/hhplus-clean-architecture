import { BaseException } from './base.exception';
import { ErrorCode } from '../constants/error-code.enum';
import { HttpStatus } from '@nestjs/common';

export class LectureNotFoundException extends BaseException {
  constructor() {
    super(
      '존재하지 않는 특강입니다.',
      ErrorCode.LECTURE_NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }
}
