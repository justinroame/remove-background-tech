import Link from "next/link";

const blogPosts = [
  {
    slug: "how-to-remove-background-from-image",
    title: "How to Remove Background from Image Online in 1 Click – Free AI Tool 2025",
    description: "Step-by-step guide + free tool to remove backgrounds instantly.",
    date: "November 28, 2025",
  },
  {
    slug: "best-background-remover-2025",
    title: "8 Best Background Removers 2025 (Tested & Ranked)",
    description: "We tested remove.bg, Photoroom + 6 more. Here’s who actually wins.",
    date: "November 28, 2025",
  },
  {
    slug: "remove-bg-vs-photoroom-vs-remove-background-tech",
    title: "remove.bg vs Photoroom vs Remove-Background.Tech – 2025 Real Test",
    description: "Side-by-side speed, quality & price comparison on the same 20 images.",
    date: "November 28, 2025",
  },
];

export const metadata = {
  title: "Blog – Remove Background Tech",
  description: "Guides, comparisons and tips for removing image backgrounds in 2025.",
};

export default function BlogIndex() {
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Blog</h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Latest guides, comparisons and tips for removing backgrounds in 2025.
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