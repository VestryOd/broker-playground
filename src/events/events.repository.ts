import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.constants';
import { Event } from '../common/types/event.types';

@Injectable()
export class EventsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<Event[]> {
    // TODO: SELECT все события, отсортируй по starts_at ASC
    // throw new Error('Not implemented');
    const { rows } = await this.pool.query<Event>(
      'SELECT * FROM events ORDER BY starts_at ASC'
    );

    return rows;
  }

  async findById(id: number): Promise<Event | null> {
    // TODO: SELECT одно событие по id
    // Если не найдено — верни null (подсказка: rows[0] ?? null)
    // throw new Error('Not implemented');
    const { rows } = await this.pool.query(
      `SELECT * FROM events WHERE id = $1`,
      [id]
    );

    return rows[0] || null;
  }
}
