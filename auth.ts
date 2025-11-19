// /auth.ts
import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// ❌ Do NOT export `auth` — NextAuth v4 does not support that helper.
