import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import fs from 'fs';
import os from 'os';
import path from 'path';

// These tests exercise the ALTER TABLE migration block in src/services/db.ts
// directly against a temporary SQLite file, rather than importing the module
// (which opens a singleton connection and schedules a setInterval).

interface ColumnInfo { name: string; type: string; }

function createBaseSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      endpoint TEXT NOT NULL,
      region TEXT DEFAULT 'us-east-1',
      access_key_enc TEXT NOT NULL,
      secret_key_enc TEXT NOT NULL,
      force_path_style INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

function runBucketMigration(db: Database.Database) {
  try {
    db.exec('ALTER TABLE connections ADD COLUMN bucket TEXT');
  } catch {
    // Column already exists — matches db.ts behavior
  }
}

describe('connections.bucket migration', () => {
  let tmpDir: string;
  let dbPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 's3e-migration-'));
    dbPath = path.join(tmpDir, 'test.db');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('adds bucket column to a fresh connections table', () => {
    const db = new Database(dbPath);
    createBaseSchema(db);
    runBucketMigration(db);

    const cols = db.prepare("PRAGMA table_info(connections)").all() as ColumnInfo[];
    const bucket = cols.find((c) => c.name === 'bucket');
    expect(bucket).toBeDefined();
    expect(bucket?.type).toBe('TEXT');
    db.close();
  });

  it('is idempotent when the column already exists', () => {
    const db = new Database(dbPath);
    createBaseSchema(db);

    runBucketMigration(db); // first run: adds column
    // Second run should be a no-op (the try/catch in db.ts swallows the error).
    expect(() => runBucketMigration(db)).not.toThrow();

    const cols = db.prepare("PRAGMA table_info(connections)").all() as ColumnInfo[];
    expect(cols.filter((c) => c.name === 'bucket').length).toBe(1);
    db.close();
  });

  it('stores null by default for pre-existing rows', () => {
    const db = new Database(dbPath);
    createBaseSchema(db);
    db.prepare(`
      INSERT INTO connections (name, endpoint, access_key_enc, secret_key_enc)
      VALUES ('legacy', 'https://s3.example.com', 'enc-a', 'enc-s')
    `).run();

    runBucketMigration(db);

    const row = db.prepare("SELECT bucket FROM connections WHERE name = 'legacy'").get() as { bucket: string | null };
    expect(row.bucket).toBeNull();
    db.close();
  });
});
