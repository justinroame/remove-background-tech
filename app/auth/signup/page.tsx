"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Signup failed");
      setLoading(false);
      return;
    }

    // Auto-login
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Account created, but auto-login failed. Please log in manually.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* Invisible SEO H1 */}
      <h1 className="sr-only">
        Create Account – Sign Up for Free AI Background Remover
      </h1>

      {/* Structured Data (FAQ Schema) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is the AI background remover free to use?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, signing up gives you 3 free credits to remove backgrounds from images using AI.",
                },
              },
            ],
          }),
        }}
      />

      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 border border-gray-200">
          
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
            Create your account
          </h2>

          <p className="text-center text-blue-600 font-medium mb-6">
            Sign up and get <span className="font-bold">3 free credits</span> 🎉
          </p>

          {error && (
            <p className="text-red-600 text-center mb-4 bg-red-100 px-4 py-3 rounded-lg border border-red-300">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              aria-label="Email"
              autoComplete="email"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-800"
            />

            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Password"
              aria-label="Password"
              autoComplete="new-password"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-800"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-4 rounded-lg font-semibold text-white transition"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <a href="/auth/login" className="text-blue-600 font-medium hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
