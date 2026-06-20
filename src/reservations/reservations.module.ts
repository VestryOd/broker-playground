import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsRepository } from './reservations.repository';
import { ReservationsService } from './reservations.service';
import { ReservationsWorker } from './reservations.worker';
import { ReservationsRateLimitGuard } from "./reservations.rate-limit.guard";

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [ReservationsController],
  providers: [
    ReservationsService,
    ReservationsRepository,
    ReservationsWorker,
    ReservationsRateLimitGuard
  ],
})
export class ReservationsModule {}
