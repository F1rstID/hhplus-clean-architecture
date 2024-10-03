import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma.module';
import { UserController } from '../interfaces/api/controllers/user.controller';
import { UserService } from '../domain/services/user.service';
import { UserUsecases } from '../application/usecases/user.usecases';
import { LectureRepositoryImpl } from '../domain/repositories/lecture.repository.impl';
import { UserRepositoryImpl } from '../domain/repositories/user.repository.impl';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserUsecases,
    { provide: 'UserRepository', useClass: UserRepositoryImpl },
    { provide: 'LectureRepository', useClass: LectureRepositoryImpl },
  ],
})
export class UserModule {}
