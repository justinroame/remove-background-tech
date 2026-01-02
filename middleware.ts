// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  /* ---------------- FORCE HTTPS ---------------- */
  if (url.protocol === "http:") {
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  /* ---------------- EDITOR PAYWALL GUARD ---------------- */
  if (url.pathname.startsWith("/editor")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Not logged in → pricing
    if (!token) {
      return NextResponse.redirect(new URL("/pricing", req.url));
    }

    // Logged in but no credits → pricing
    const credits = Number((token as any)?.credits ?? 0);
    if (credits <= 0) {
      return NextResponse.redirect(new URL("/pricing", req.url));
    }
  }

  return NextResponse.next();
}

/* ---------------- MATCHER ---------------- */
export const config = {
  matcher: ["/:path*"],
};
