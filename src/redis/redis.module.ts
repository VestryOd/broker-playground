import { Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT, REDIS_SUBSCRIBER } from './redis.constants';
import { RedisLockService } from './redis.lock.service';
import { RedisPubSubService } from './redis.pubsub.service';

const redisFactory = (config: ConfigService): Redis =>
  new Redis({
    host: config.getOrThrow<string>('REDIS_HOST'),
    port: config.getOrThrow<number>('REDIS_PORT'),
    lazyConnect: false,
  });

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: redisFactory,
      inject: [ConfigService],
    },
    {
      provide: REDIS_SUBSCRIBER,
      useFactory: redisFactory,
      inject: [ConfigService],
    },
    RedisLockService,
    RedisPubSubService,
  ],
  exports: [REDIS_CLIENT, RedisLockService, RedisPubSubService],
})
export class RedisModule implements OnModuleDestroy {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(REDIS_SUBSCRIBER) private readonly subscriber: Redis,
  ) {}

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
    await this.subscriber.quit();
  }
}
