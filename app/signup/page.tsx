"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      window.location.href = "/login";
    } else {
      alert("Sign up failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">

      {/* LOGO */}
      <div className="mb-10 flex flex-col items-center">
        <Image
          src="/background_image_remover.png"
          alt="Remove Background Tech Logo"
          width={300}
          height={90}
          priority
        />
      </div>

      <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Your name"
            className="border p-3 rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="you@example.com"
            className="border p-3 rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-black text-white py-2 rounded-md mt-2">
            Sign Up
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600">Login</Link>
        </p>
      </div>
    </div>
  );
}
