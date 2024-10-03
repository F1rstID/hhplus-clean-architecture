// src/infrastructure/prisma/Lecture.mapper.ts
import { UserLecture as UserLectureEntity } from '../../domain/entities/user-lecture.entity';
import { UserLecture as PrismaUserLecture } from '@prisma/client';

export class UserLectureMapper {
  static toDomain(prismaUserLecture: PrismaUserLecture): UserLectureEntity {
    if (!prismaUserLecture) return null;

    return new UserLectureEntity(
      prismaUserLecture.id,
      prismaUserLecture.userId,
      prismaUserLecture.lectureId,
    );
  }

  static toPrisma(userLecture: UserLectureEntity): PrismaUserLecture {
    return {
      id: userLecture.id,
      lectureId: userLecture.lectureId,
      userId: userLecture.userId,
    };
  }
}
