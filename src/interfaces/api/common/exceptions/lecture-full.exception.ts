import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../constants/error-code.enum';

export class LectureFullException extends BaseException {
  constructor() {
    super(
      '특강 정원이 초과되었습니다.',
      ErrorCode.LECTURE_FULL,
      HttpStatus.BAD_REQUEST,
    );
  }
}
