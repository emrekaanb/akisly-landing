import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type { LeadInput } from "./lead-schema";

export type LeadRecord = LeadInput & { id: number; createdAt: string };

type LeadRow = {
  id: number;
  name: string;
  email: string;
  service: string;
  description: string;
  created_at: string;
};

const DUPLICATE_WINDOW_MINUTES = 10;

const globalForDb = globalThis as unknown as {
  __leadsDb?: { db: Database.Database; file: string };
};

export function resolveDbPath(): string {
  return path.resolve(
    /*turbopackIgnore: true*/ process.env.LEADS_DB_PATH ?? path.join(process.cwd(), "data", "leads.db"),
  );
}

export function getDb(): Database.Database {
  const file = resolveDbPath();
  const cached = globalForDb.__leadsDb;
  if (cached && cached.file === file && cached.db.open) return cached.db;

  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL,
      service     TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE INDEX IF NOT EXISTS idx_leads_email_created ON leads (email, created_at);
  `);
  globalForDb.__leadsDb = { db, file };
  return db;
}

export function closeDb(): void {
  globalForDb.__leadsDb?.db.close();
  globalForDb.__leadsDb = undefined;
}

function toRecord(row: LeadRow): LeadRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    service: row.service as LeadRecord["service"],
    description: row.description,
    createdAt: row.created_at,
  };
}

export function isRecentDuplicate(lead: LeadInput): boolean {
  const row = getDb()
    .prepare(
      `SELECT 1 FROM leads
       WHERE lower(email) = lower(?) AND service = ? AND description = ?
         AND created_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?)
       LIMIT 1`,
    )
    .get(
      lead.email,
      lead.service,
      lead.description,
      `-${DUPLICATE_WINDOW_MINUTES} minutes`,
    );
  return row !== undefined;
}

export function insertLead(lead: LeadInput): LeadRecord {
  const row = getDb()
    .prepare(
      `INSERT INTO leads (name, email, service, description)
       VALUES (@name, @email, @service, @description)
       RETURNING *`,
    )
    .get(lead) as LeadRow;
  return toRecord(row);
}

export function listLeads(limit = 100): LeadRecord[] {
  const rows = getDb()
    .prepare(`SELECT * FROM leads ORDER BY id DESC LIMIT ?`)
    .all(limit) as LeadRow[];
  return rows.map(toRecord);
}

export function countLeads(): number {
  const row = getDb().prepare(`SELECT COUNT(*) AS n FROM leads`).get() as {
    n: number;
  };
  return row.n;
}
