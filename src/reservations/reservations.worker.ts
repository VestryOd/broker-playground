import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationsRepository } from './reservations.repository';

@Injectable()
export class ReservationsWorker {
  private readonly logger = new Logger(ReservationsWorker.name);

  constructor(private readonly reservationsRepository: ReservationsRepository) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async releaseExpiredReservations(): Promise<void> {
    const released = await this.reservationsRepository.releaseExpired();
    if (released > 0) {
      this.logger.log(`Released ${released} expired reservation(s)`);
    }
  }
}
