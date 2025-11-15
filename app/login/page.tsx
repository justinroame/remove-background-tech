"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid credentials");
    } else {
      window.location.href = "/editor";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow max-w-md w-full">
        <h1 className="text-2xl font-bold mb-8 text-center">Log in</h1>

        <button
          className="w-full mb-4 bg-blue-600 text-white py-3 rounded-lg"
          onClick={() => signIn("google")}
        >
          Continue with Google
        </button>

        <form onSubmit={handleLogin} className="space-y-4">
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

          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
            type="submit"
          >
            Log in
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Don’t have an account?{" "}
          <Link className="text-blue-600" href="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
