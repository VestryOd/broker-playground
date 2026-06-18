import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { EventsService } from './events.service';

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository],
})
export class EventsModule {}
