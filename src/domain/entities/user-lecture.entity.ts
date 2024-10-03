import { Lecture } from './lecture.entity';

export class UserLecture {
  constructor(
    public readonly id: number,
    public userId: number,
    public lectureId: number,
    public lecture?: Lecture,
  ) {}

  isAlreadyRegistered(): boolean {
    console.log(this);
    return true;
  }
}
