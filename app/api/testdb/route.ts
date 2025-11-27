import { db } from "@/lib/db";

export async function GET() {
  try {
    const r = await db.execute("SELECT NOW()");
    return Response.json({ ok: true, result: r });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) });
  }
}
