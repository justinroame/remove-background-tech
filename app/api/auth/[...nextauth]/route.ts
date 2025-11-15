import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import bcrypt from "bcryptjs"; // ✔ bcryptjs works on Vercel!
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const handler = NextAuth({
  session: { strategy: "jwt" },

  providers: [
    // ------------ GOOGLE LOGIN --------------
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ------------ EMAIL + PASSWORD LOGIN --------------
    Credentials({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Find user by email
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        const user = existing[0];

        if (!user) {
          console.log("No user found");
          return null;
        }

        // Validate password using bcryptjs
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          console.log("Invalid password");
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  }
});

export const GET = handler;
export const POST = handler;
