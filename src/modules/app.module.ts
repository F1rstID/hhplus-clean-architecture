import { Module } from '@nestjs/common';
import { AppController } from '../interfaces/api/controllers/app.controller';
import { AppService } from '../domain/services/app.service';
import { PrismaModule } from './prisma.module';
import { ConfigModule } from '@nestjs/config';
import { LectureModule } from './lecture.module';
import { UserModule } from './user.module';
import { RedisModule } from './redis.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    LectureModule,
    UserModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
