import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma.module';
import { LectureController } from '../interfaces/api/controllers/lecture.controller';
import { LectureService } from '../domain/services/lecture.service';
import { LectureUsecases } from '../application/usecases/lecture.usecases';
import { LectureRepositoryImpl } from '../domain/repositories/lecture.repository.impl';
import { TransactionService } from '../infrastructure/prisma/transaction.service';
import { UserRepositoryImpl } from '../domain/repositories/user.repository.impl';
import { UserService } from '../domain/services/user.service';
import { RedlockService } from '../infrastructure/redis/redlock.service';
import { RedisService } from '../infrastructure/redis/redis.service';

@Module({
  imports: [PrismaModule],
  controllers: [LectureController],
  providers: [
    LectureService,
    LectureUsecases,
    UserService,
    { provide: 'UserRepository', useClass: UserRepositoryImpl },
    { provide: 'LectureRepository', useClass: LectureRepositoryImpl },
    TransactionService,
  ],
})
export class LectureModule {}
