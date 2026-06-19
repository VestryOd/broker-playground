import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT, REDIS_KEYS, REDIS_TTL } from '../redis/redis.constants';
import { EventsRepository } from './events.repository';
import { Event } from '../common/types/event.types';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async findAll(): Promise<Event[]> {
    const cached = await this.redis.get(REDIS_KEYS.eventsAll);
    if (cached) {
      return JSON.parse(cached) as Event[];
    }

    const events = await this.eventsRepository.findAll();
    await this.redis.setex(REDIS_KEYS.eventsAll, REDIS_TTL.eventsAll, JSON.stringify(events));
    return events;
  }

  async findById(id: number): Promise<Event> {
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }
    return event;
  }
}
