import { IsInt, IsPositive } from 'class-validator';

export class RegisterLectureReqDto {
  @IsInt()
  @IsPositive()
  userId: number;

  @IsInt()
  @IsPositive()
  lectureId: number;
}

export class RegisterLectureResDto {
  success: boolean;
}
