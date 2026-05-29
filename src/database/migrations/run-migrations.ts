import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';
import { MigrationRunner } from './migration-runner';

dotenv.config();

async function main(): Promise<void> {
  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT ?? 5432),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  await client.connect();

  const migrationsDir = path.resolve(__dirname, '../../../migrations');
  const runner = new MigrationRunner(client, migrationsDir);

  try {
    await runner.run();
    console.log('All migrations applied successfully');
  } finally {
    await client.end();
  }
}

main().catch((err: unknown) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
