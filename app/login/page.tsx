"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
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

      {/* Login Card */}
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-center text-2xl font-semibold mb-6">Log in</h1>

        <button
          onClick={() => signIn("google")}
          className="w-full bg-blue-600 text-white py-2 rounded-md mb-4"
        >
          Continue with Google
        </button>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded mb-4"
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded-md">
          Log in
        </button>

        <p className="text-center text-sm mt-3">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
