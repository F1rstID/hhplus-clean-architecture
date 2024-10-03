import { Inject, Injectable } from '@nestjs/common';
import { Lecture } from '../entities/lecture.entity';
import { LectureRepository } from '../../interfaces/repositories/lecture.repository.interface';
import { UserLecture } from '../entities/user-lecture.entity';
import { Prisma } from '@prisma/client';
import { LectureNotFoundException } from '../../interfaces/api/common/exceptions/lecture-not-found.exception';
import { LectureFullException } from '../../interfaces/api/common/exceptions/lecture-full.exception';
import { LectureAlreadyRegisteredException } from '../../interfaces/api/common/exceptions/lecture-already_registered.exception';
import { TransactionService } from '../../infrastructure/prisma/transaction.service';
import { RedlockService } from '../../infrastructure/redis/redlock.service';
import { ResourceLockedError } from 'redlock';
import { LectureRegisterFailed } from '../../interfaces/api/common/exceptions/lecture-register-failed';

@Injectable()
export class LectureService {
  constructor(
    @Inject('LectureRepository')
    private readonly lectureRepository: LectureRepository,
    private readonly transactionService: TransactionService,
    private readonly redlockService: RedlockService,
  ) {}

  async isRegisteredLecture(): Promise<boolean> {
    return false;
  }

  async findLecture(
    lectureId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Lecture | null> {
    return this.lectureRepository.findLecture(lectureId, tx);
  }

  async findUserLecture(
    lectureId: number,
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<UserLecture | null> {
    return this.lectureRepository.findUserLecture(lectureId, userId, tx);
  }

  verifyLecture(lecture: Lecture): void {
    if (!lecture) throw new LectureNotFoundException();
    if (!lecture.isAvailable()) throw new LectureFullException();
  }

  verifyAlreadyRegistered(userLecture: UserLecture): void {
    if (userLecture) throw new LectureAlreadyRegisteredException();
  }

  async registerLecture(lectureId: number, userId: number): Promise<void> {
    const lockKey = `registerLecture:${lectureId}:${userId}`;
    const lockTTL = 5000;
    try {
      await this.redlockService.redlock.using([lockKey], lockTTL, async () => {
        await this.transactionService.run(async (tx) => {
          const lecture = await this.findLecture(lectureId, tx);
          this.verifyLecture(lecture);

          const userLecture = await this.findUserLecture(lectureId, userId, tx);
          this.verifyAlreadyRegistered(userLecture);

          await this.lectureRepository.registerLecture(lectureId, userId, tx);
          await this.lectureRepository.increaseRegisteredCount(lectureId, tx);
        });
      });
    } catch (err) {
      if (err instanceof LectureNotFoundException)
        throw new LectureNotFoundException();

      if (err instanceof LectureFullException) throw new LectureFullException();

      if (err instanceof LectureAlreadyRegisteredException)
        throw new LectureAlreadyRegisteredException();

      if (err instanceof ResourceLockedError) throw new LectureRegisterFailed();
    }
  }

  private getDateRange(dateString: string): {
    startDate: Date;
    endDate: Date;
  } {
    const date = new Date(dateString);

    return {
      startDate: new Date(
        Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      ),
      endDate: new Date(
        Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      ),
    };
  }

  async findAvailableLectures(date: string): Promise<Lecture[]> {
    const { startDate, endDate } = this.getDateRange(date);

    console.log(startDate, endDate);

    const lectures = await this.lectureRepository.findLecturesByDate(
      startDate,
      endDate,
    );

    return lectures.filter((lecture) => lecture.isAvailable());
  }
}
