"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/editor",
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">

      {/* LOGO */}
      <div className="mb-10 flex flex-col items-center">
        <Image
          src="/background_image_remover.png"
          alt="Remove Background Tech Logo"
          width={300}
          height={90}
          priority
        />
      </div>

      <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Log in</h1>

        <button
          onClick={() => signIn("google")}
          className="w-full bg-blue-600 text-white py-2 rounded-md mb-4"
        >
          Continue with Google
        </button>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-3 rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded-md mt-2">
            Log in
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-600">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
