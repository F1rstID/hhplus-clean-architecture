// src/infrastructure/prisma/Lecture.mapper.ts
import { Lecture as LectureEntity } from '../../domain/entities/lecture.entity';
import { Lecture as PrismaLecture } from '@prisma/client';

export class LectureMapper {
  static toDomain(prismaLecture: PrismaLecture): LectureEntity {
    if (!prismaLecture) return null;

    return new LectureEntity(
      prismaLecture.id,
      prismaLecture.speakerId,
      prismaLecture.title,
      prismaLecture.description,
      prismaLecture.date,
      prismaLecture.registeredCount,
      prismaLecture.capacity,
    );
  }

  static toPrisma(lecture: LectureEntity): PrismaLecture {
    return {
      id: lecture.id,
      speakerId: lecture.speakerId,
      title: lecture.title,
      description: lecture.description,
      date: lecture.date,
      registeredCount: lecture.registeredCount,
      capacity: lecture.capacity,
    };
  }
}
