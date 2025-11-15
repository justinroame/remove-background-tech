import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    // -----------------------------
    // GOOGLE PROVIDER
    // Auto-creates user in DB
    // -----------------------------
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // -----------------------------
    // EMAIL + PASSWORD LOGIN
    // -----------------------------
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing email or password");
        }

        const result = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        const user = result[0];
        if (!user) throw new Error("User not found");
        if (!user.password) throw new Error("Account has no password");

        const valid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!valid) throw new Error("Invalid password");

        return { id: String(user.id), email: user.email };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: { strategy: "jwt" },

  callbacks: {
    // ---------------------------------------------------
    // GOOGLE SIGN-IN: Auto-create user in Postgres
    // ---------------------------------------------------
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;

        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, email as string))
          .limit(1);

        if (existing.length === 0) {
          // Create DB user for Google accounts
          await db.insert(users).values({
            email: email!,
            password: null,        // Google accounts have no password
            pro: false,
            totalCredits: 0,
            stripeCustomerId: null,
          });
        }
      }
      return true;
    },

    // ---------------------------------------------------
    // JWT CALLBACK — store user.id + credits
    // ---------------------------------------------------
    async jwt({ token, user }) {
      // First login
      if (user) {
        token.id = user.id;
      }

      return token;
    },

    // ---------------------------------------------------
    // SESSION CALLBACK — expose id to frontend
    // ---------------------------------------------------
    async session({ session, token }) {
      if (token?.id) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
