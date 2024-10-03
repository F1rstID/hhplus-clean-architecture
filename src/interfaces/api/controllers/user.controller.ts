import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Lecture } from '../../../domain/entities/lecture.entity';
import { UserUsecases } from '../../../application/usecases/user.usecases';

@Controller('user')
export class UserController {
  constructor(private readonly userUseCase: UserUsecases) {}

  @Get(':userId/lectures')
  async myLectures(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Lecture[]> {
    return this.userUseCase.myLectures(userId);
  }
}
