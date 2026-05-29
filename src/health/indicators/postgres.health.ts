import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../../database/database.constants';

@Injectable()
export class PostgresHealthIndicator {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    try {
      await this.pool.query('SELECT 1');
      return indicator.up();
    } catch (err) {
      return indicator.down({ message: (err as Error).message });
    }
  }
}
