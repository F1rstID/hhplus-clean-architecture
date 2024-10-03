import { Injectable } from '@nestjs/common';
import { RegisterLectureResDto } from '../../interfaces/api/dtos/register-lecture.dto';
import { Lecture } from '../../domain/entities/lecture.entity';
import { LectureService } from '../../domain/services/lecture.service';
import { UserService } from '../../domain/services/user.service';

@Injectable()
export class LectureUsecases {
  constructor(
    private readonly lectureService: LectureService,
    private readonly userService: UserService,
  ) {}

  async available(date: string): Promise<Lecture[]> {
    return this.lectureService.findAvailableLectures(date);
  }

  async register(
    lectureId: number,
    userId: number,
  ): Promise<RegisterLectureResDto> {
    const user = await this.userService.findUser(userId);
    this.userService.verifyUser(user);
    await this.lectureService.registerLecture(lectureId, userId);

    return { success: true };
  }
}
