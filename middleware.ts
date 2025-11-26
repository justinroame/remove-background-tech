// middleware.ts
import { NextResponse } from "next/server";
import { ratelimit } from "@/lib/rate-limit";

export async function middleware(req: Request) {
  const url = new URL(req.url);

  if (url.pathname.startsWith("/api/remove-background")) {
    const ip =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      crypto.randomUUID();

    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return new NextResponse("Too many requests — please log in.", {
        status: 429,
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/remove-background"],
};
