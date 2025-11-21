"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordInner() {
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    if (!res.ok) return setStatus(data.error || "Error resetting password");

    setStatus("Password reset! You may now log in.");
  }

  return (
    <div className="max-w-md mx-auto p-10">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>

      {!token ? (
        <p className="text-red-600">Missing reset token.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            className="w-full border p-3 rounded"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-blue-600 text-white p-3 rounded">
            Reset Password
          </button>
        </form>
      )}

      {status && <p className="mt-6">{status}</p>}
    </div>
  );
}
