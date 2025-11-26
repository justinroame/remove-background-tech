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
    <>
      {/* SEO-visible H1 but visually hidden */}
      <h1 className="sr-only">
        Log In – Access Your AI Background Remover Account
      </h1>

      {/* Minimal SEO schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What can I do after logging in?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "Logging in allows you to download clean images without watermarks, manage credits, and use the full AI background removal editor."
                }
              }
            ]
          }),
        }}
      />

      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F6] px-4">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-gray-100">

          <h2 className="text-3xl font-bold text-center mb-2">Log in</h2>

          <p className="text-center text-gray-500 mb-6">
            Welcome back — log in to continue
          </p>

          {error && (
            <p className="text-red-600 text-center mb-4 text-sm bg-red-100 px-3 py-2 rounded-lg border border-red-300">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email address"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <input
              type="password"
              className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <button
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition"
              type="submit"
            >
              Log In
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            <Link
              href="/auth/forgot-password"
              className="text-blue-600 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </p>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </>
  );
}
