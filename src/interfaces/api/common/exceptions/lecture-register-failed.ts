import { BaseException } from './base.exception';
import { ErrorCode } from '../constants/error-code.enum';
import { HttpStatus } from '@nestjs/common';

export class LectureRegisterFailed extends BaseException {
  constructor() {
    super(
      '특강 신청에 실패하였습니다.',
      ErrorCode.LECTURE_REGISTER_FAILED,
      HttpStatus.BAD_REQUEST,
    );
  }
}
