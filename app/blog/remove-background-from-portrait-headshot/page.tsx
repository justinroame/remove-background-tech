import Link from "next/link";

export const metadata = {
  title: "Remove Background from Portrait & Headshot – Free AI 2025",
  description: "Perfect hair edges on portraits and headshots. Free AI tool.",
};

export default function Page() {
  return (
    <>
      <article className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Remove Background from Portrait & Headshot – Free AI 2025
        </h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 my-10 text-center">
          <Link href="/" className="inline-block bg-black text-white px-10 py-5 rounded-xl text-xl font-bold">
            Remove Portrait Background Now
          </Link>
        </div>

        <h2>Why hair edges matter</h2>
        <p>Bad hair cutouts ruin professional headshots. Our AI handles flyaway hair perfectly.</p>

        <h2>Results you get</h2>
        <ul>
          <li>Clean edges around hair</li>
          <li>Transparent PNG ready for LinkedIn, resumes, websites</li>
          <li>3 full credits on signup</li>
        </ul>

        <div className="text-center my-16">
          <Link href="/" className="inline-block bg-black text-white px-10 py-5 rounded-xl text-xl font-bold">
            Clean Portrait Background Free
          </Link>
        </div>
      </article>
    </>
  );
}