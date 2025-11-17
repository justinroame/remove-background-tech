import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

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

        // ✅ match your actual Drizzle syntax
        const user = await db.query.users.findFirst({
          where: (u) => eq(u.email, email),
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        // MUST return a User-like object
        return {
          id: String(user.id),
          email: user.email,
          totalCredits: user.totalCredits ?? 0, // ensure defined
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.totalCredits = user.totalCredits ?? 0;
      }
      return token;
    },

    async session({ session, token }) {
      if (!session.user) session.user = {};

      session.user.id = token.id;
      session.user.email = token.email;
      session.user.totalCredits = token.totalCredits;

      return session;
    },
  },

  pages: {
    signIn: "/auth/login", // matches YOUR routes
  },
});

export { handler as GET, handler as POST };
