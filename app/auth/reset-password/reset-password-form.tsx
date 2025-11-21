"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();

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

    if (!res.ok) {
      setStatus("Error: " + data.error);
      return;
    }

    setStatus("Password updated! Redirecting…");
    setTimeout(() => router.push("/auth/login"), 1500);
  }

  if (!token) {
    return <div className="p-10">Invalid reset link.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-10">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          className="w-full border p-3 rounded"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full bg-blue-600 text-white p-3 rounded">
          Update Password
        </button>
      </form>

      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}
