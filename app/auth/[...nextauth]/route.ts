import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

// Fetch user helper — uses your existing API route /api/user/get
async function getUserByEmail(email: string) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/user/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Fetch user failed:", e);
    return null;
  }
}

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

        const user = await getUserByEmail(credentials.email);
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

  // ⭐ FIX: Extend session to 1 YEAR
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 365,
  },

  // ⭐ FIX: Extend JWT lifetime to 1 YEAR
  jwt: {
    maxAge: 60 * 60 * 24 * 365,
  },

  pages: {
    signIn: "/auth/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user = { id: token.id, email: token.email };
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
