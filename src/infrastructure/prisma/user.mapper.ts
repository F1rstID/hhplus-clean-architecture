// src/infrastructure/prisma/Lecture.mapper.ts
import { User as UserEntity } from '../../domain/entities/user.entity';
import { User as PrismaUser } from '@prisma/client';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): UserEntity {
    if (!prismaUser) return null;

    return new UserEntity(prismaUser.id);
  }

  static toPrisma(user: UserEntity): PrismaUser {
    return {
      id: user.id,
    };
  }
}
