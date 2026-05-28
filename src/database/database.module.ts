import { Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { DATABASE_POOL } from './database.constants';

@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      useFactory: (configService: ConfigService): Pool => {
        const host = configService.getOrThrow<string>('DATABASE_HOST');
        const port = configService.getOrThrow<number>('DATABASE_PORT');
        const user = configService.getOrThrow<string>('DATABASE_USER');
        const password = configService.getOrThrow<string>('DATABASE_PASSWORD');
        const database = configService.getOrThrow<string>('DATABASE_NAME');
        const min = configService.getOrThrow<number>('DATABASE_POOL_MIN');
        const max = configService.getOrThrow<number>('DATABASE_POOL_MAX');

        return new Pool({
          host,
          port,
          user,
          password,
          database,
          min,
          max,
          idleTimeoutMillis: 30_000,
          connectionTimeoutMillis: 5_000,
        })
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_POOL],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  onModuleDestroy(): Promise<void> {
    return this.pool.end();
  }
}
