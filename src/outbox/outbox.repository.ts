import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.constants';
import { OutboxEvent } from '../common/types/outbox.types';

@Injectable()
export class OutboxRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findUnpublished(limit = 50): Promise<OutboxEvent[]> {
    const { rows } = await this.pool.query<OutboxEvent>(
      `SELECT * FROM outbox
         WHERE published = false
         ORDER BY created_at ASC
         LIMIT $1`,
      [limit],
    );
    return rows;
  }

  async markPublished(ids: number[]): Promise<void> {
    await this.pool.query(
      `UPDATE outbox SET published = true WHERE id = ANY($1)`,
      [ids],
    );
  }
}
