import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { countLeads, insertLead, isRecentDuplicate, listLeads } from "@/lib/db";
import { leadSchema, type CreateLeadResponse } from "@/lib/lead-schema";

export const runtime = "nodejs";

function json(body: CreateLeadResponse, status: number) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json(
      { ok: false, error: "invalid_json", message: "İstek gövdesi geçerli JSON değil." },
      400,
    );
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    return json(
      {
        ok: false,
        error: "validation",
        message: "Lütfen işaretli alanları düzeltin.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      422,
    );
  }

  try {
    if (isRecentDuplicate(parsed.data)) {
      return json(
        {
          ok: false,
          error: "duplicate",
          message:
            "Bu talebi birkaç dakika önce zaten aldık. Aynı talebi tekrar göndermenize gerek yok.",
        },
        409,
      );
    }
    const lead = insertLead(parsed.data);
    return json({ ok: true, lead: { id: lead.id, createdAt: lead.createdAt } }, 201);
  } catch (error) {
    console.error("[api/leads] failed to persist lead", error);
    return json(
      {
        ok: false,
        error: "server",
        message: "Talebiniz kaydedilemedi. Lütfen biraz sonra tekrar deneyin.",
      },
      500,
    );
  }
}

function tokenMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return Response.json(
      { ok: false, message: "Kayıt listeleme kapalı: ADMIN_TOKEN tanımlı değil." },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const provided = bearer ?? url.searchParams.get("token") ?? "";
  if (!tokenMatches(provided, expected)) {
    return Response.json({ ok: false, message: "Yetkisiz." }, { status: 401 });
  }

  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 50, 1), 500);
  return Response.json({ ok: true, total: countLeads(), leads: listLeads(limit) });
}
