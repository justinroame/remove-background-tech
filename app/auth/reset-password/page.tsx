"use client";

export const dynamic = "force-dynamic"; // ✅ required so useSearchParams won't break build

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const router = useRouter();
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
      setStatus(data.error || "Error resetting password.");
      return;
    }

    setStatus("Password updated! Redirecting...");
    setTimeout(() => router.push("/auth/login"), 1500);
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto p-10">
        <h1 className="text-2xl font-bold mb-4">Invalid reset link</h1>
        <p>Please request a new password reset.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-10">
      <h1 className="text-2xl font-bold mb-6">Choose a new password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New password"
          className="w-full border p-3 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white p-3 rounded">
          Reset Password
        </button>
      </form>

      {status && <p className="mt-4 text-gray-700">{status}</p>}
    </div>
  );
}
