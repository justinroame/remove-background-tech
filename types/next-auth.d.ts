import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      totalCredits: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    totalCredits: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    totalCredits: number;
  }
}
