import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/leads/route";
import { closeDb } from "@/lib/db";
import { leadSchema } from "@/lib/lead-schema";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "akisly-test-"));
let dbFile: string;
let testCounter = 0;

const validLead = {
  name: "Deneme Kullanıcı",
  email: "deneme@example.com",
  service: "invoicing",
  description: "Aylık 40 civarı faturayı elle kesiyoruz, otomatikleştirmek istiyoruz.",
};

function postRequest(body: unknown, raw = false) {
  return new Request("http://localhost/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

function rowsInDb() {
  if (!fs.existsSync(dbFile)) return [];
  const db = new Database(dbFile, { readonly: true });
  const rows = db.prepare("SELECT * FROM leads ORDER BY id").all();
  db.close();
  return rows as Array<Record<string, unknown>>;
}

beforeEach(() => {
  closeDb();
  dbFile = path.join(tmpDir, `leads-${++testCounter}.db`);
  process.env.LEADS_DB_PATH = dbFile;
  process.env.ADMIN_TOKEN = "test-token";
});

afterAll(() => {
  closeDb();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("shared lead schema", () => {
  it("trims values and accepts a valid lead", () => {
    const result = leadSchema.parse({ ...validLead, name: "  Ayşe Yılmaz  " });
    expect(result.name).toBe("Ayşe Yılmaz");
  });

  it("rejects an unknown service", () => {
    const result = leadSchema.safeParse({ ...validLead, service: "crypto-mining" });
    expect(result.success).toBe(false);
  });
});

describe("POST /api/leads", () => {
  it("persists a valid lead and returns 201 with the new id", async () => {
    const res = await POST(postRequest(validLead));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.lead.id).toBeTypeOf("number");

    const rows = rowsInDb();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: body.lead.id,
      name: validLead.name,
      email: validLead.email,
      service: validLead.service,
      description: validLead.description,
    });
  });

  it("stores trimmed values", async () => {
    await POST(postRequest({ ...validLead, name: "   Mehmet Örnek   " }));
    expect(rowsInDb()[0].name).toBe("Mehmet Örnek");
  });

  it("returns 422 with per-field errors and writes nothing for invalid input", async () => {
    const res = await POST(
      postRequest({ name: "A", email: "not-an-email", service: "nope", description: "kısa" }),
    );
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.ok).toBe(false);
    expect(body.error).toBe("validation");
    expect(Object.keys(body.fieldErrors).sort()).toEqual(
      ["description", "email", "name", "service"].sort(),
    );
    expect(body.fieldErrors.email[0]).toMatch(/e-posta/i);
    expect(rowsInDb()).toHaveLength(0);
  });

  it("returns 422 for missing fields", async () => {
    const res = await POST(postRequest({}));
    const body = await res.json();
    expect(res.status).toBe(422);
    expect(body.fieldErrors.name).toBeDefined();
    expect(body.fieldErrors.service).toBeDefined();
  });

  it("rejects overly long descriptions", async () => {
    const res = await POST(postRequest({ ...validLead, description: "x".repeat(1001) }));
    expect(res.status).toBe(422);
    expect((await res.json()).fieldErrors.description).toBeDefined();
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await POST(postRequest("{not json", true));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("invalid_json");
  });

  it("returns 409 for an identical submission within the duplicate window", async () => {
    expect((await POST(postRequest(validLead))).status).toBe(201);
    const res = await POST(postRequest({ ...validLead, email: "DENEME@example.com" }));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe("duplicate");
    expect(rowsInDb()).toHaveLength(1);
  });

  it("keeps records after the connection is closed and reopened (restart)", async () => {
    await POST(postRequest(validLead));
    await POST(postRequest({ ...validLead, service: "inventory" }));

    closeDb();

    const res = await GET(
      new Request("http://localhost/api/leads", {
        headers: { authorization: "Bearer test-token" },
      }),
    );
    const body = await res.json();
    expect(body.total).toBe(2);
    expect(body.leads.map((l: { service: string }) => l.service)).toEqual([
      "inventory",
      "invoicing",
    ]);
  });

  it("returns 500 without claiming success when the database cannot be opened", async () => {
    closeDb();
    process.env.LEADS_DB_PATH = path.join(tmpDir, "is-a-dir.db");
    fs.mkdirSync(process.env.LEADS_DB_PATH, { recursive: true });

    const res = await POST(postRequest(validLead));
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.ok).toBe(false);
    expect(body.error).toBe("server");
  });
});

describe("GET /api/leads", () => {
  it("requires the admin token", async () => {
    const res = await GET(new Request("http://localhost/api/leads"));
    expect(res.status).toBe(401);
  });

  it("accepts the token as a query parameter", async () => {
    await POST(postRequest(validLead));
    const res = await GET(new Request("http://localhost/api/leads?token=test-token"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.leads[0].email).toBe(validLead.email);
  });

  it("is disabled when ADMIN_TOKEN is not configured", async () => {
    delete process.env.ADMIN_TOKEN;
    const res = await GET(new Request("http://localhost/api/leads?token=anything"));
    expect(res.status).toBe(503);
  });
});
