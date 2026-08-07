import { sql } from "drizzle-orm";
import { ensureSchema } from "@/db/ensure-schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ ok: false, error: "DATABASE_URL not configured" }, { status: 500 });
    }

    await ensureSchema();

    const { getDb } = await import("@/db");
    const db = getDb();
    await db.execute(sql`select 1`);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Health check failed:", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
