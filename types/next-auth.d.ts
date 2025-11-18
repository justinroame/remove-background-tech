import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      totalCredits: number;
      pro: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string | number;
    email: string;
    totalCredits: number;
    pro: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string | number;
    email: string;
    totalCredits: number;
    pro: boolean;
  }
}
