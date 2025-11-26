// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: String(user.id),
          email: user.email,
          totalCredits: user.totalCredits ?? 3,
          pro: user.pro ?? false,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  /** 
   * ⭐ EXTENDED SESSION + JWT LIFETIME
   * Default was 1 hour → now 30 days
   * Fixes the “still looks logged in but isn’t” bug 
   */
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 DAYS
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 DAYS
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
      token.id = user.id;
      token.totalCredits = user.totalCredits ?? 3;
      token.pro = user.pro ?? false;
      token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (!session.user) session.user = {} as any;

      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.totalCredits = token.totalCredits as number;
      session.user.pro = token.pro as boolean;

      return session;
    },

    // 🔥 Always redirect login/signup → homepage
    async redirect({ baseUrl }) {
      return baseUrl + "/";
    },
  },

  pages: {
    signIn: "/auth/login",
  },
};
