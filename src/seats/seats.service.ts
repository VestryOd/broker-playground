import { Injectable, Inject } from "@nestjs/common";
import { SeatsRepository } from "./seats.repository";
import { Seat } from "../common/types/seat.types";
import { REDIS_CLIENT, REDIS_KEYS, REDIS_TTL } from "../redis/redis.constants";
import Redis from "ioredis";

@Injectable()
export class SeatsService {
  constructor(
    private readonly seatsRepository: SeatsRepository,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async findAllAvailable(eventId: number): Promise<Seat[]> {
    const key = REDIS_KEYS.seatsAvailableByEvent(eventId);
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached) as Seat[];
    }
    const available = await this.seatsRepository.findAvailableByEventId(eventId);
    await this.redis.setex(key, REDIS_TTL.seatsAvailable, JSON.stringify(available));
    return available;
  }

  async findByEventId(eventId: number): Promise<Seat[]> {
    const key = REDIS_KEYS.seatsByEvent(eventId);
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached) as Seat[];
    }
    const seats = await this.seatsRepository.findByEventId(eventId);
    await this.redis.setex(key, REDIS_TTL.seatsByEvent, JSON.stringify(seats));
    return seats;
  }
}