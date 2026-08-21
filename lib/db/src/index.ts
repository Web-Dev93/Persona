import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import path from "path";
import fs from "fs";
import * as schema from "./schema";
import { seedDatabase } from "./seed";

const { Pool } = pg;

let pool: any = null;
let db: any = null;

const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS persona_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    default_style TEXT NOT NULL DEFAULT 'professional',
    system_prompt TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '#6366f1',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  ALTER TABLE persona_types ADD COLUMN IF NOT EXISTS slug TEXT;
  ALTER TABLE persona_types ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
  ALTER TABLE persona_types ADD COLUMN IF NOT EXISTS default_style TEXT DEFAULT 'professional';
  ALTER TABLE persona_types ADD COLUMN IF NOT EXISTS system_prompt TEXT DEFAULT '';
  ALTER TABLE persona_types ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6366f1';
  ALTER TABLE persona_types ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

  CREATE TABLE IF NOT EXISTS personas (
    id SERIAL PRIMARY KEY,
    persona_type_id INTEGER REFERENCES persona_types(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    title TEXT NOT NULL DEFAULT '',
    photo_url TEXT,
    style TEXT,
    additional_prompt TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  ALTER TABLE personas ADD COLUMN IF NOT EXISTS slug TEXT;
  ALTER TABLE personas ADD COLUMN IF NOT EXISTS title TEXT DEFAULT '';
  ALTER TABLE personas ADD COLUMN IF NOT EXISTS photo_url TEXT;
  ALTER TABLE personas ADD COLUMN IF NOT EXISTS style TEXT;
  ALTER TABLE personas ADD COLUMN IF NOT EXISTS additional_prompt TEXT DEFAULT '';
  ALTER TABLE personas ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;
  ALTER TABLE personas ADD COLUMN IF NOT EXISTS persona_type_id INTEGER REFERENCES persona_types(id) ON DELETE SET NULL;
  ALTER TABLE personas ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

  CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    session_token TEXT NOT NULL,
    email_sent BOOLEAN NOT NULL DEFAULT false,
    completed BOOLEAN NOT NULL DEFAULT false,
    summary TEXT,
    persona_id INTEGER REFERENCES personas(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  ALTER TABLE conversations ADD COLUMN IF NOT EXISTS persona_id INTEGER REFERENCES personas(id) ON DELETE SET NULL;
  ALTER TABLE conversations ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false;
  ALTER TABLE conversations ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
  ALTER TABLE conversations ADD COLUMN IF NOT EXISTS summary TEXT;
  ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
`;

const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:password@helium/heliumdb?sslmode=disable";

if (dbUrl) {
  try {
    const testPool = new Pool({
      connectionString: dbUrl,
      connectionTimeoutMillis: 3000,
    });

    // Test connection & initialize tables
    const client = await testPool.connect();
    await client.query(INIT_SQL);
    client.release();

    pool = testPool;
    db = drizzlePg(pool, { schema });
    console.log("[DB] Connected successfully to PostgreSQL database:", dbUrl.replace(/:[^:@]+@/, ":***@"));
  } catch (err: any) {
    console.warn("[DB] Could not connect to PostgreSQL (" + err.message + "). Falling back to embedded persistent PGlite storage.");
  }
}

if (!db) {
  // Use embedded PGlite for persistent zero-dependency local / preview storage
  const dataDir = path.join(process.cwd(), ".data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const pglite = new PGlite(path.join(dataDir, "pgdata"));

  await pglite.exec(INIT_SQL).catch((err) => {
    console.warn("[DB] PGlite table init notice:", err.message);
  });

  db = drizzlePglite(pglite, { schema });
  console.log("[DB] Initialized embedded PGlite database storage.");
}

// Seed predefined types and personas
await seedDatabase(db);

export { pool, db };
export * from "./schema";
export * from "./seed";
