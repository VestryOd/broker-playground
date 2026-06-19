import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

const RELEASE_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

@Injectable()
export class RedisLockService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async acquire(key: string, owner: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.redis.set(key, owner, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async release(key: string, owner: string): Promise<void> {
    await this.redis.eval(RELEASE_SCRIPT, 1, key, owner);
  }
}
