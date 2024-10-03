import { Injectable } from '@nestjs/common';
import { UserService } from '../../domain/services/user.service';

@Injectable()
export class UserUsecases {
  constructor(private readonly userService: UserService) {}

  async myLectures(userId: number) {
    const user = await this.userService.findUser(userId);
    this.userService.verifyUser(user);
    return this.userService.myLectures(userId);
  }
}
