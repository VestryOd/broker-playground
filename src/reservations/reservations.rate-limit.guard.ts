import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import Redis from 'ioredis';
import { REDIS_CLIENT, REDIS_KEYS, REDIS_TTL } from '../redis/redis.constants';

@Injectable()
export class ReservationsRateLimitGuard implements CanActivate {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = Number(request.body?.userId);

    if (!userId) return true;

    const key = REDIS_KEYS.reservationsRateLimit(userId);
    const now = Date.now();
    const windowMs = REDIS_TTL.rateLimitWindowSec * 1000;

    await this.redis.zremrangebyscore(key, 0, (now - windowMs));
    const count = await this.redis.zcard(key);

    if (count >= REDIS_TTL.rateLimitMax) {
      throw new HttpException('Too many reservation requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    await this.redis.zadd(key, now, String(now));
    await this.redis.expire(key, REDIS_TTL.rateLimitWindowSec);

    return true;
  }
}
