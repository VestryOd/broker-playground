import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { OutboxRepository } from './outbox.repository';
import { OutboxWorker } from "./outbox.worker";

@Module({
  imports: [DatabaseModule, RedisModule],
  providers: [OutboxRepository, OutboxWorker],
  exports: [OutboxRepository],
})
export class OutboxModule {}
