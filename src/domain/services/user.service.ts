import { Inject, Injectable } from '@nestjs/common';
import { LectureRepository } from '../../interfaces/repositories/lecture.repository.interface';
import { UserRepository } from '../../interfaces/repositories/user.repository.interface';
import { User } from '../entities/user.entity';
import { UserNotFoundException } from '../../interfaces/api/common/exceptions/user-not-found.exception';

@Injectable()
export class UserService {
  constructor(
    @Inject('LectureRepository')
    private readonly lectureRepository: LectureRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  verifyUser(user: User) {
    if (!user) throw new UserNotFoundException();
  }

  async findUser(userId: number) {
    return this.userRepository.findUser(userId);
  }

  async myLectures(userId: number) {
    return this.lectureRepository.findUserLectures(userId);
  }
}
