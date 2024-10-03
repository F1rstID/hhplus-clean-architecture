import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redlock from 'redlock';

@Injectable()
export class RedlockService {
  public readonly redlock: Redlock;

  constructor(private readonly redisService: RedisService) {
    this.redlock = new Redlock([this.redisService.client], {
      retryCount: 10,
      retryDelay: 200, // 밀리초 단위
    });
  }
}
