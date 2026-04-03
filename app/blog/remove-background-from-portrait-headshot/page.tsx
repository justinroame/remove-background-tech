import Link from "next/link";

export const metadata = {
  title: "How to Remove Backgrounds from Portraits and Headshots",
  description:
    "Prepare portraits and headshots for LinkedIn, resumes, websites, and profile graphics with a cleaner background.",
};

export default function Page() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-6">
        How to Remove Backgrounds from Portraits and Headshots
      </h1>

      <p className="text-xl text-gray-600 mb-8">
        A cleaner portrait background can make a headshot look more polished on LinkedIn, team pages, resumes, speaker bios, and profile graphics.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 my-10 text-center">
        <Link href="/" className="inline-block bg-black text-white px-10 py-5 rounded-xl text-xl font-bold">
          Remove Portrait Background Now
        </Link>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-4">When this is useful</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>LinkedIn profile photos</li>
        <li>Resume and portfolio graphics</li>
        <li>Team pages and speaker bios</li>
        <li>Personal brand assets</li>
      </ul>

      <h2 className="text-2xl font-bold mt-12 mb-4">Simple workflow</h2>
      <ol className="list-decimal pl-6 space-y-2">
        <li>Upload your headshot or portrait</li>
        <li>Remove the original background</li>
        <li>Use the transparent PNG in your preferred layout or brand template</li>
      </ol>

      <h2 className="text-2xl font-bold mt-12 mb-4">Related guides</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><Link href="/blog/remove-background-without-photoshop" className="underline">How to remove backgrounds without Photoshop</Link></li>
        <li><Link href="/blog/how-to-remove-background-from-image" className="underline">How to remove a background from an image online</Link></li>
      </ul>

      <div className="text-center my-16">
        <Link href="/" className="inline-block bg-black text-white px-10 py-5 rounded-xl text-xl font-bold">
          Clean Portrait Background Free
        </Link>
      </div>
    </article>
  );
}
