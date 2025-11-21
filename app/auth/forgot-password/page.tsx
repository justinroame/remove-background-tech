"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);

    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>

        {sent ? (
          <p className="text-green-600">
            If that email exists, a reset link has been sent.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full px-4 py-3 border rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {error && <p className="text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
