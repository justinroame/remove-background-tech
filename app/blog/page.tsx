// app/blog/page.tsx
import Link from "next/link";

const blogPosts = [
  {
    slug: "how-to-remove-background-from-image",
    title: "How to Remove Background from Image Online in 1 Click",
    description: "A simple step-by-step guide to removing backgrounds online and downloading a transparent PNG in seconds.",
    date: "April 2, 2026",
  },
  {
    slug: "best-background-remover-2025",
    title: "Best Background Remover Tools in 2026: Which One Fits Your Workflow?",
    description: "A practical guide to choosing the right background remover for product photos, logos, headshots, and quick one-off edits.",
    date: "April 2, 2026",
  },
  {
    slug: "remove-bg-vs-photoroom-vs-remove-background-tech",
    title: "remove.bg vs Photoroom vs Remove-Background.Tech",
    description: "A clear comparison of speed, editing workflow, pricing, and who each tool is best for.",
    date: "April 2, 2026",
  },
  {
    slug: "remove-background-tech-vs-remove-bg",
    title: "Remove-Background.Tech vs remove.bg",
    description: "Which tool is better for fast transparent PNGs, simple pricing, and everyday background removal?",
    date: "April 2, 2026",
  },
  {
    slug: "remove-background-tech-vs-photoroom",
    title: "Remove-Background.Tech vs Photoroom",
    description: "A side-by-side look at one-click background removal versus a broader product-photo editing workflow.",
    date: "April 2, 2026",
  },
  {
    slug: "remove-background-tech-vs-pixlr-background-remover",
    title: "Remove-Background.Tech vs Pixlr Background Remover",
    description: "Compare simplicity, image cleanup workflow, and who each tool works best for.",
    date: "April 2, 2026",
  },
  {
    slug: "remove-background-product-photos-etsy-shopify",
    title: "How to Remove Backgrounds from Product Photos for Etsy and Shopify",
    description: "A practical guide for sellers who need cleaner product photos, white backgrounds, and faster listing prep.",
    date: "April 2, 2026",
  },
  {
    slug: "remove-background-for-amazon-listings",
    title: "How to Remove Backgrounds for Amazon Product Listings",
    description: "A focused guide to cleaner product images, white backgrounds, and listing-ready photos for Amazon sellers.",
    date: "April 2, 2026",
  },
  {
    slug: "white-background-product-photos",
    title: "How to Make White Background Product Photos Quickly",
    description: "Why white backgrounds matter for ecommerce and how to create them without spending hours editing images.",
    date: "April 2, 2026",
  },
  {
    slug: "remove-background-without-photoshop",
    title: "How to Remove Backgrounds Without Photoshop",
    description: "The fastest way to get a clean transparent PNG without learning complex photo-editing software.",
    date: "April 2, 2026",
  },
  {
    slug: "remove-background-from-logo",
    title: "How to Remove a Background from a Logo",
    description: "Turn a logo into a transparent PNG for websites, merch, packaging, and social graphics.",
    date: "April 2, 2026",
  },
  {
    slug: "remove-background-from-portrait-headshot",
    title: "How to Remove Backgrounds from Portraits and Headshots",
    description: "A cleaner way to prepare portraits and headshots for LinkedIn, websites, resumes, and profile graphics.",
    date: "April 2, 2026",
  },
];

export const metadata = {
  title: "Background Removal Blog | Guides, Comparisons, and Ecommerce Tips",
  description:
    "Guides, tool comparisons, and practical tips for product photos, transparent PNGs, logos, and faster background removal workflows.",
};

export default function BlogIndex() {
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Blog</h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Guides, comparisons, and practical tips for product photos, transparent PNGs, logos, and faster editing workflows.
        </p>

        <div className="space-y-8">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block border rounded-xl p-6 hover:border-blue-400 hover:shadow-md transition"
            >
              <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-3">{post.description}</p>
              <p className="text-sm text-gray-500">{post.date}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            href="/"
            className="inline-block bg-black text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-800"
          >
            Back to Remove Background Tool
          </Link>
        </div>
      </div>
    </>
  );
}
