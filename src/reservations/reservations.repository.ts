import {ConflictException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.constants';
import { Reservation } from '../common/types/reservation.types';

@Injectable()
export class ReservationsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async create(userId: number, seatId: number): Promise<Reservation> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const { rows: seatRow } = await client.query(
        `SELECT id, status FROM seats WHERE id = $1 FOR UPDATE NOWAIT`, [seatId]
      );

      if (!seatRow[0]) throw new NotFoundException(`Seat ${seatId} not found`);
      if (seatRow[0].status !== 'available') throw new ConflictException('Seat is not available');

      await client.query(
        `UPDATE seats SET status = 'held' WHERE id = $1`, [seatId]
      );
      const { rows: reservationRows } = await client.query<Reservation>(
        `INSERT INTO reservations (user_id, seat_id, status, expires_at)
        VALUES ($1, $2, 'pending', NOW() + INTERVAL '10 minutes') RETURNING *`,
        [userId, seatId]
      );
      await client.query('COMMIT');

      return reservationRows[0];
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch (e) {
        console.log(`Error on ROLLBACK: ${e}`);
      }
      throw err;
    } finally {
      client.release();
    }
  }

  async findById(id: number): Promise<Reservation | null> {
    const { rows } = await this.pool.query<Reservation>(
      'SELECT * FROM reservations WHERE id = $1',
      [id],
    );
    return rows[0] ?? null;
  }
}
