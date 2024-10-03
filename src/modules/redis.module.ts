import { Global, Module } from '@nestjs/common';
import { RedisService } from '../infrastructure/redis/redis.service';
import { RedlockService } from '../infrastructure/redis/redlock.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisService, RedlockService],
  exports: [RedisService, RedlockService],
})
export class RedisModule {}
