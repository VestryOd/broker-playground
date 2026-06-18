import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.constants';
import { EventsRepository } from './events.repository';
import { Event } from '../common/types/event.types';

const EVENTS_ALL_KEY = 'events:all';
const EVENTS_ALL_TTL = 60;

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async findAll(): Promise<Event[]> {
    const cached = await this.redis.get(EVENTS_ALL_KEY);
    if (cached) {
      return JSON.parse(cached) as Event[];
    }

    const events = await this.eventsRepository.findAll();
    await this.redis.setex(EVENTS_ALL_KEY, EVENTS_ALL_TTL, JSON.stringify(events));
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
