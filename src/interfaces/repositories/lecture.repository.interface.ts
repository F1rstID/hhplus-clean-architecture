import { Lecture } from '../../domain/entities/lecture.entity';
import { UserLecture } from '../../domain/entities/user-lecture.entity';
import { Prisma } from '@prisma/client';

export interface LectureRepository {
  registerLecture(
    lectureId: number,
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<UserLecture>;
  findAvailableLectures(endDate: Date): Promise<Lecture[]>;
  findUserLecture(
    lectureId: number,
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<UserLecture>;
  countUserLecture(lectureId: number): Promise<number>;
  findLecture(
    lectureId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Lecture | null>;
  increaseRegisteredCount(
    lectureId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Lecture>;
  findUserLectures(userId: number): Promise<Lecture[]>;
  findLecturesByDate(startDate: Date, endDate: Date): Promise<Lecture[]>;
}
