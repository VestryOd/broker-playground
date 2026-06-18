import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ReservationsRepository } from './reservations.repository';
import { CreateReservationDto, Reservation } from '../common/types/reservation.types';
import {REDIS_CLIENT} from "../redis/redis.constants";
import Redis from "ioredis";

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async create(dto: CreateReservationDto): Promise<Reservation> {
    const { reservation, eventId } = await this.reservationsRepository.create(dto.userId, dto.seatId);
    await this.redis.del(`seats:event:${eventId}`);

    return reservation;
  }

  async findById(id: number): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Reservation ${id} not found`);
    }
    return reservation;
  }
}
