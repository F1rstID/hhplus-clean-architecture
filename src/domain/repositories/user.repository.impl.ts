import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserMapper } from '../../infrastructure/prisma/user.mapper';
import { User } from '../entities/user.entity';
import { UserRepository } from '../../interfaces/repositories/user.repository.interface';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUser(userId: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return UserMapper.toDomain(user);
  }
}
