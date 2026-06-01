import { Injectable, Inject } from "@nestjs/common";
import {DATABASE_POOL} from "../database/database.constants";
import {Pool} from "pg";
import {Seat} from "../common/types/seat.types";

@Injectable()
export class SeatsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findByEventId(eventId: number): Promise<Seat[]> {
    const { rows } = await this.pool.query<Seat>(
      `SELECT * FROM seats WHERE event_id = $1`,
      [eventId]
    );

    return rows;
  }

  async findAvailableByEventId(eventId: number): Promise<Seat[]> {
    const { rows } = await this.pool.query<Seat>(
      `SELECT * FROM seats WHERE event_id = $1 AND status = $2`,
      [eventId, 'available']
    );

    return rows;
  }
}