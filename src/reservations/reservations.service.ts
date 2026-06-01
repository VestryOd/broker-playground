import { Injectable, NotFoundException } from '@nestjs/common';
import { ReservationsRepository } from './reservations.repository';
import { CreateReservationDto, Reservation } from '../common/types/reservation.types';

@Injectable()
export class ReservationsService {
  constructor(private readonly reservationsRepository: ReservationsRepository) {}

  create(dto: CreateReservationDto): Promise<Reservation> {
    return this.reservationsRepository.create(dto.userId, dto.seatId);
  }

  async findById(id: number): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Reservation ${id} not found`);
    }
    return reservation;
  }
}
