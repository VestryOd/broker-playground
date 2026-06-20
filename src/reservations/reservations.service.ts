import { Injectable, NotFoundException, Inject, ConflictException, Logger } from '@nestjs/common';
import { ReservationsRepository } from './reservations.repository';
import { CreateReservationDto, Reservation } from '../common/types/reservation.types';
import {REDIS_CHANNELS, REDIS_CLIENT, REDIS_KEYS, REDIS_TTL} from "../redis/redis.constants";
import Redis from "ioredis";
import { RedisLockService } from "../redis/redis.lock.service";
import { RedisPubSubService } from "../redis/redis.pubsub.service";

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    private readonly redisLockService: RedisLockService,
    private readonly pubSubService: RedisPubSubService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async create(dto: CreateReservationDto): Promise<Reservation> {
    let succeeded = false;
    const key = REDIS_KEYS.seatLock(dto.seatId);
    const acquire = await this.redisLockService.acquire(key, String(dto.userId), REDIS_TTL.seatLock);
    if (!acquire) {
      throw new ConflictException('Seat is already being reserved');
    }

    try {
      const { reservation, eventId } = await this.reservationsRepository.create(dto.userId, dto.seatId);
      await this.redis.del(REDIS_KEYS.seatsAvailableByEvent(eventId));
      succeeded = !!reservation;
      await this.pubSubService.publish(REDIS_CHANNELS.reservationCreated, {
        id: reservation.id,
        userId: dto.userId,
      });

      return reservation;
    } finally {
      if (!succeeded) {
        try {
          await this.redisLockService.release(key, String(dto.userId));
        } catch (err) {
          this.logger.error(`Failed to release lock ${key}`, err);
        }
      }
    }
  }

  async findById(id: number): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Reservation ${id} not found`);
    }
    return reservation;
  }
}
