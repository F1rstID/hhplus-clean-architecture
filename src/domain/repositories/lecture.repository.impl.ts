import { Injectable } from '@nestjs/common';
import { LectureRepository } from '../../interfaces/repositories/lecture.repository.interface';
import { Lecture } from '../entities/lecture.entity';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserLecture } from '../entities/user-lecture.entity';
import { LectureMapper } from '../../infrastructure/prisma/lecture.mapper';
import { UserLectureMapper } from '../../infrastructure/prisma/user-lecture.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class LectureRepositoryImpl implements LectureRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findLecture(
    lectureId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Lecture | null> {
    const client = tx ?? this.prisma;
    const lecture = await client.lecture.findUnique({
      where: {
        id: lectureId,
      },
    });

    return LectureMapper.toDomain(lecture);
  }

  async findAvailableLectures(date: Date): Promise<Lecture[]> {
    const availableLectures = await this.prisma.lecture.findMany({
      where: {
        date: {
          gte: date,
        },
      },
    });

    return availableLectures.map((lecture) => LectureMapper.toDomain(lecture));
  }

  async registerLecture(
    lectureId: number,
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<UserLecture> {
    const client = tx ?? this.prisma;
    const createdUserLecture = await client.userLecture.create({
      data: {
        lectureId,
        userId,
      },
    });

    return UserLectureMapper.toDomain(createdUserLecture);
  }

  async findUserLecture(
    lectureId: number,
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<UserLecture> {
    const client = tx ?? this.prisma;
    const userLecture = await client.userLecture.findUnique({
      where: {
        userId_lectureId: {
          lectureId,
          userId,
        },
      },
    });

    if (!userLecture) return null;

    return UserLectureMapper.toDomain(userLecture);
  }

  async countUserLecture(lectureId: number): Promise<number> {
    return this.prisma.userLecture.count({
      where: {
        lectureId,
      },
    });
  }

  async increaseRegisteredCount(
    lectureId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Lecture> {
    const client = tx ?? this.prisma;
    const increasedLecture = await client.lecture.update({
      where: {
        id: lectureId,
      },
      data: {
        registeredCount: {
          increment: 1,
        },
      },
    });

    return LectureMapper.toDomain(increasedLecture);
  }

  async findLecturesByDate(startDate, endDate: Date) {
    const lectures = await this.prisma.lecture.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    return lectures.map((lecture) => LectureMapper.toDomain(lecture));
  }

  async findUserLectures(userId: number) {
    const userLectures = await this.prisma.userLecture.findMany({
      where: {
        userId,
      },
      include: {
        lecture: true,
      },
    });

    return userLectures.map((userLecture) =>
      LectureMapper.toDomain(userLecture.lecture),
    );
  }
}
