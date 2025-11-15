import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        if (!user || !user.password) return null;

        const match = await bcrypt.compare(credentials.password, user.password);
        if (!match) return null;

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account }) {
      // If signing in with Google, create user if missing
      if (account?.provider === "google") {
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email!))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(users).values({
            email: user.email!,
            password: null,
          });
        }
      }
      return true;
    },

    async jwt({ token }) {
      return token;
    },

    async session({ session, token }) {
      if (token?.email) session.user.email = token.email as string;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
