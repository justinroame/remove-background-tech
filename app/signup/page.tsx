"use client";

import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-8">

      {/* Logo */}
      <div className="flex flex-col items-center">
        <Image
          src="/background_image_remover.png"
          alt="Remove Background Tech Logo"
          width={300}
          height={300}
          priority
        />
      </div>

      {/* Signup Card */}
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-center text-2xl font-semibold mb-6">
          Create Account
        </h1>

        <input
          type="text"
          placeholder="Your name"
          className="w-full border p-2 rounded mb-3"
        />

        <input
          type="email"
          placeholder="you@example.com"
          className="w-full border p-2 rounded mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded mb-4"
        />

        <button className="w-full bg-black text-white py-2 rounded-md">
          Sign Up
        </button>

        <p className="text-center text-sm mt-3">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
