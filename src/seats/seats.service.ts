import { Injectable, Inject } from "@nestjs/common";
import { SeatsRepository } from "./seats.repository";
import { Seat } from "../common/types/seat.types";
import { REDIS_CLIENT } from "../redis/redis.constants";
import Redis from "ioredis";

const SEATS_BY_ID_KEY = 'seats:event';
const SEATS_BY_ID_TTL = 30;

@Injectable()
export class SeatsService {
  constructor(
    private readonly seatsRepository: SeatsRepository,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  findAllAvailable(event_id: number): Promise<Seat[]> {
    return this.seatsRepository.findAvailableByEventId((event_id));
  }

  async findByEventId(eventId: number): Promise<Seat[]> {
    const key = `${SEATS_BY_ID_KEY}:${eventId}`;
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached) as Seat[];
    }
    const seats = await this.seatsRepository.findByEventId(eventId);
    await this.redis.setex(key, SEATS_BY_ID_TTL, JSON.stringify(seats));
    return seats;
  }
}