"use client";

import { useState } from "react";
import { createUser } from "@/lib/auth";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Signup failed");

      await signIn("credentials", { email, password, redirect: true });
    } catch {
      setError("Signup failed — maybe email already exists");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow max-w-md w-full">
        <h1 className="text-2xl font-bold mb-8 text-center">Create an account</h1>

        <button
          className="w-full mb-4 bg-blue-600 text-white py-3 rounded-lg"
          onClick={() => signIn("google")}
        >
          Sign up with Google
        </button>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button className="w-full bg-yellow-500 text-white py-3 rounded-lg">
            Sign up
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link className="text-blue-600" href="/login">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
