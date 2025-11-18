// app/auth/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: (formData.get("name") as string) || undefined,
    };

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Signup failed");
      setLoading(false);
      return;
    }

    // SAFE auto-login — this is correct and production-ready
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Account created! Please log in.");
      setLoading(false);
    } else {
      router.push("/pricing");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Create your account</h1>
        
        {error && <p className="text-red-400 text-center mb-4 bg-red-900/50 px-4 py-3 rounded">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <input name="name" placeholder="Name (optional)" className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white" />
          <input name="email" type="email" required placeholder="Email" className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white" />
          <input name="password" type="password" required minLength={6} placeholder="Password" className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white" />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-4 rounded-lg font-semibold text-white transition"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-400 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
}