"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);

    setDone(true);

    setTimeout(() => router.push("/auth/login"), 1500);
  }

  if (!token) return <p>Invalid reset link.</p>;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">

        <h1 className="text-2xl font-bold mb-4">Choose a new password</h1>

        {done ? (
          <p className="text-green-600">Password updated! Redirecting...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="password"
              required
              minLength={6}
              placeholder="New password"
              className="w-full px-4 py-3 border rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-red-600">{error}</p>}

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
              Reset Password
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
