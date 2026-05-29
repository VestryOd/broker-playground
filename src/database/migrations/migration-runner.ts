import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

export class MigrationRunner {
  constructor(
    private readonly client: Client,
    private readonly migrationsDir: string,
  ) {}

  async run(): Promise<void> {
    await this.ensureMigrationsTable();
    const applied = await this.getAppliedMigrations();

    const files = this.readMigrationFiles();

    for (const { name, sql } of files) {
      if (!applied.includes(name)) {
        console.log(`Applying: ${name}`);
        await this.applyMigration(name, sql);
      } else {
        console.log(`Skipping: ${name}`);
      }
    }
  }

  private async ensureMigrationsTable(): Promise<void> {
    await this.client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name VARCHAR PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW()
                             )`)
  }

  private async getAppliedMigrations(): Promise<string[]> {
    const { rows } = await this.client.query<{ name: string }>(`SELECT name from schema_migrations ORDER BY name ASC`);
    return rows.map(r => r.name);
  }

  private async applyMigration(name: string, sql: string): Promise<void> {
    try {
      await this.client.query('BEGIN');

      await this.client.query(sql);
      await this.client.query('INSERT INTO schema_migrations(name) VALUES ($1)', [name]);
      await this.client.query('COMMIT');
    } catch(err) {
      await this.client.query('ROLLBACK');
      throw err;
    }
  }

  private readMigrationFiles(): Array<{ name: string; sql: string }> {
    const files = fs
      .readdirSync(this.migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    return files.map((file) => ({
      name: file,
      sql: fs.readFileSync(path.join(this.migrationsDir, file), 'utf-8'),
    }));
  }
}
