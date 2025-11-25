"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    window.location.href = "/";
  }

  return (
    <div className="max-w-md mx-auto p-10">
      <h1 className="text-2xl font-bold mb-6">Log in</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          className="w-full border p-3 rounded"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-3 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white p-3 rounded">
          Log In
        </button>
      </form>

      {/* 🔵 Forgot Password moved BELOW everything */}
      <p className="mt-6 text-center text-sm">
        <Link
          href="/auth/forgot-password"
          className="text-blue-600 hover:underline"
        >
          Forgot password?
        </Link>
      </p>
    </div>
  );
}
