import Link from "next/link";

export const metadata = {
  title: "How to Remove Backgrounds from Product Photos for Etsy and Shopify",
  description:
    "A practical guide for Etsy and Shopify sellers who need cleaner product photos, transparent PNGs, and listing-ready images.",
};

export default function Page() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-6">
        How to Remove Backgrounds from Product Photos for Etsy and Shopify
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Cleaner product photos help listings look more professional, easier to scan, and more consistent across your store. You do not need a full
        studio setup to get there.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 my-10 text-center">
        <Link href="/" className="inline-block bg-black text-white px-10 py-5 rounded-xl text-xl font-bold">
          Remove Background from Product Photo Now
        </Link>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-4">Why sellers remove backgrounds</h2>
      <p className="mb-4">
        On Etsy and Shopify, product photos often do a lot of the selling before people ever read the description. Removing distracting backgrounds can make
        products look cleaner, more premium, and easier to place into graphics, listing images, or mockups.
      </p>

      <h2 className="text-2xl font-bold mt-12 mb-4">Simple workflow</h2>
      <ol className="list-decimal pl-6 space-y-2">
        <li>Take a product photo on a plain or ordinary background</li>
        <li>Upload it to <Link href="/" className="underline">remove-background.tech</Link></li>
        <li>Download the transparent PNG</li>
        <li>Place it on white, brand-colored, or marketplace-ready backgrounds as needed</li>
      </ol>

      <h2 className="text-2xl font-bold mt-12 mb-4">Best use cases</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Etsy product listings</li>
        <li>Shopify featured images</li>
        <li>Promo graphics and sale banners</li>
        <li>Simple product mockups</li>
      </ul>

      <h2 className="text-2xl font-bold mt-12 mb-4">When to pair this with white backgrounds</h2>
      <p className="mb-4">
        A transparent cutout gives you more flexibility. You can reuse the same product on white backgrounds for cleaner catalog images, on brand-colored backgrounds
        for ads, or inside listing graphics for store promos.
      </p>

      <h2 className="text-2xl font-bold mt-12 mb-4">Related reading</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><Link href="/blog/white-background-product-photos" className="underline">How to make white background product photos</Link></li>
        <li><Link href="/blog/remove-background-for-amazon-listings" className="underline">How to remove backgrounds for Amazon listings</Link></li>
        <li><Link href="/blog/remove-background-tech-vs-photoroom" className="underline">Remove-Background.Tech vs Photoroom</Link></li>
        <li><Link href="/pricing" className="underline">Pricing</Link></li>
      </ul>

      <div className="text-center my-16">
        <Link href="/" className="inline-block bg-black text-white px-10 py-5 rounded-xl text-xl font-bold">
          Start Removing Backgrounds Free
        </Link>
      </div>
    </article>
  );
}
