import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT, REDIS_SUBSCRIBER, REDIS_CHANNELS } from './redis.constants';

@Injectable()
export class RedisPubSubService implements OnModuleInit {
  private readonly logger = new Logger(RedisPubSubService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly publisher: Redis,
    @Inject(REDIS_SUBSCRIBER) private readonly subscriber: Redis,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.subscriber.subscribe(REDIS_CHANNELS.reservationCreated);

    this.subscriber.on('message', (_channel: string, message: string) => {
      const { id, userId } = JSON.parse(message);
      this.logger.log(`[RedisPubSubService] reservation.created → id: ${id}, userId: ${userId}`)
    });

    this.logger.log(`Subscribed to channel: ${REDIS_CHANNELS.reservationCreated}`);
  }

  async publish(channel: string, payload: object): Promise<void> {
    await this.publisher.publish(channel, JSON.stringify(payload));
  }
}
