import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const valid = await compare(credentials.password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],

  // ⭐ EXTENDED SESSION (fixes your issue!)
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  },

  // ⭐ Extend JWT token life too
  jwt: {
    maxAge: 60 * 60 * 24 * 365,
  },

  pages: {
    signIn: "/auth/login",
  },

  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        session.user = { id: token.sub, email: token.email };
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
