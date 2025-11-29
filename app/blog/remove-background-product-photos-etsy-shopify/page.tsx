import Link from "next/link";

export const metadata = {
  title: "Remove Background from Product Photos – Etsy & Shopify Guide 2025",
  description: "Best ways to get clean product photos for Etsy and Shopify. Free AI tool + step-by-step.",
};

export default function Page() {
  return (
    <>
      <article className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Remove Background from Product Photos – Etsy & Shopify Guide 2025
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Clean white or transparent backgrounds = higher sales. Here’s exactly how to do it fast and free.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 my-10 text-center">
          <Link href="/" className="inline-block bg-black text-white px-10 py-5 rounded-xl text-xl font-bold">
            Remove Background from Product Photo Now
          </Link>
        </div>

        <h2>Why product photos need clean backgrounds</h2>
        <p>Etsy and Shopify buyers decide in 3 seconds. Messy backgrounds = lost sales.</p>

        <h2>Step-by-step (takes 30 seconds)</h2>
        <ol>
          <li>Take photo on any background</li>
          <li>Upload here → <Link href="/" className="underline">remove-background.tech</Link></li>
          <li>Get transparent PNG instantly</li>
          <li>Drop into Canva or Shopify</li>
        </ol>

        <h2>Free vs paid results</h2>
        <ul>
          <li>5 free tries (small watermark)</li>
          <li>3 full-resolution credits on signup – no card</li>
          <li>Unlimited monthly plan available</li>
        </ul>

        <div className="text-center my-16">
          <Link href="/" className="inline-block bg-black text-white px-10 py-5 rounded-xl text-xl font-bold">
            Start Removing Backgrounds Free
          </Link>
        </div>
      </article>
    </>
  );
}