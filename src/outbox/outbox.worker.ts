import { Injectable, Logger } from '@nestjs/common';
import { OutboxRepository } from "./outbox.repository";
import { Cron, CronExpression } from '@nestjs/schedule'
import { RedisPubSubService } from "../redis/redis.pubsub.service";
import { REDIS_CHANNELS } from "../redis/redis.constants";

@Injectable()
export class OutboxWorker {
  private readonly logger = new Logger(OutboxWorker.name);

  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly pubSubService: RedisPubSubService,
  ) {
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async releaseOutboxQueue() {
    const incoming = await this.outboxRepository.findUnpublished();

    if (!incoming.length) {
      return;
    }

    for (const { payload: { userId, reservationId } } of incoming) {
      this.logger.log(
        `[OutboxWorker] Publishing: reservation.created → { reservationId: ${reservationId}, userId: ${userId} }`
      );

      await this.pubSubService.publish(REDIS_CHANNELS.reservationCreated, {
        id: reservationId,
        userId: userId,
      });
    }

    const ids = incoming.map((event) => event.id);
    await this.outboxRepository.markPublished(ids);
  }
}