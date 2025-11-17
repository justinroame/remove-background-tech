// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        // MUST return the full User object including totalCredits
        return {
          id: String(user.id),
          email: user.email,
          name: user.name ?? "",
          totalCredits: user.totalCredits ?? 0,
          pro: user.pro ?? false,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On login:
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.totalCredits = (user as any).totalCredits ?? 0;
        token.pro = (user as any).pro ?? false;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.totalCredits = token.totalCredits as number;
        session.user.pro = token.pro as boolean;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },
};
