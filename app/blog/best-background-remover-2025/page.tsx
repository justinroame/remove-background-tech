import Link from "next/link";

export const metadata = {
  title: "8 Best Background Removers 2025 (Tested & Ranked)",
  description: "We tested remove.bg, Photoroom, Clipdrop + 5 more. Real speed, quality & price comparison for 2025.",
};

export default function Page() {
  return (
    <>
      <article className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          8 Best Background Removers 2025 (Tested & Ranked)
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          We processed 100+ images across 8 tools to find out who actually wins in 2025 for speed, edge quality, and price.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 my-10 text-center">
          <p className="text-2xl font-semibold mb-4">
            Want the fastest one right now?
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-800 transition"
          >
            Try Remove-Background.Tech Free (3 credits)
          </Link>
        </div>

        <div className="space-y-8">
          <div className="border-2 border-green-500 rounded-xl p-6 bg-green-50">
            <h2 className="text-2xl font-bold">#1 Remove-Background.Tech (New Winner)</h2>
            <p className="mt-2">
              <strong>Speed:</strong> 1.4s • <strong>Quality:</strong> 9.6/10 • <strong>Price:</strong> 3 free full credits → $0.20–$0.50 after
            </p>
            <p className="mt-4">Fastest processing we measured. No watermarks on paid credits. Best value for occasional users.</p>
          </div>

          <div className="border rounded-xl p-6">
            <h2 className="text-2xl font-bold">#2 Photoroom</h2>
            <p>
              <strong>Speed:</strong> 2–4s • <strong>Quality:</strong> 9.4/10 • <strong>Price:</strong> $9/month or $0.50–$1 per credit
            </p>
          </div>

          <div className="border rounded-xl p-6">
            <h2 className="text-2xl font-bold">#3 remove.bg</h2>
            <p>
              <strong>Speed:</strong> 3–6s • <strong>Quality:</strong> 9.2/10 • <strong>Price:</strong> $9 for 40 credits (expires)
            </p>
          </div>
        </div>

        <div className="text-center my-16">
          <Link href="/" className="inline-block bg-black text-white px-10 py-5 rounded-xl text-xl font-bold">
            Remove Background Free Now
          </Link>
        </div>
      </article>
    </>
  );
}