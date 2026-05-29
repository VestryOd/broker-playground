import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { HealthController } from './health.controller';
import { PostgresHealthIndicator } from './indicators/postgres.health';
import { RedisHealthIndicator } from './indicators/redis.health';

@Module({
  imports: [TerminusModule, DatabaseModule, RedisModule],
  controllers: [HealthController],
  providers: [PostgresHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}
