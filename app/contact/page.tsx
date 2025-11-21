"use client";

import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    const form = new FormData(e.target as HTMLFormElement);

    const res = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        message: form.get("message"),
      }),
      headers: { "Content-Type": "application/json" }
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setStatus(json.error || "Something went wrong.");
      return;
    }

    setStatus("Message sent successfully!");
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full bg-white p-10 rounded-2xl shadow-xl border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Contact Us</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="name"
            required
            placeholder="Your Name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />

          <input
            name="email"
            type="email"
            required
            placeholder="Your Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />

          <textarea
            name="message"
            required
            placeholder="Your Message"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>

        {status && (
          <p className="mt-4 text-center text-sm text-gray-700">{status}</p>
        )}
      </div>
    </div>
  );
}
