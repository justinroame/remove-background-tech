import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// 🚨 DO NOT export authOptions (NOT allowed in v5)

const handler = NextAuth({
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

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user || !user.password) return null;

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.name ?? "",
          totalCredits: user.totalCredits ?? 0,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.totalCredits = (user as any).totalCredits ?? 0;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.totalCredits = token.totalCredits as number;
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },
});

export { handler as GET, handler as POST };
