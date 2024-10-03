import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Lecture } from '../../../domain/entities/lecture.entity';
import { RegisterLectureResDto } from '../dtos/register-lecture.dto';
import { LectureUsecases } from '../../../application/usecases/lecture.usecases';

@Controller('lecture')
export class LectureController {
  constructor(private readonly lectureUsecase: LectureUsecases) {}

  @Post(':lectureId/register/:userId')
  async registerLecture(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<RegisterLectureResDto> {
    return this.lectureUsecase.register(lectureId, userId);
  }

  @Get('available')
  async availableLectures(@Query('date') date: string): Promise<Lecture[]> {
    return this.lectureUsecase.available(date);
  }
}
