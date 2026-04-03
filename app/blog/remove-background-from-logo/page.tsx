import Link from "next/link";

export const metadata = {
  title: "How to Remove a Background from a Logo",
  description:
    "Turn a logo into a transparent PNG for websites, merch, social graphics, and product packaging.",
};

export default function Page() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-6">
        How to Remove a Background from a Logo
      </h1>

      <p className="text-xl text-gray-600 mb-8">
        If you have a logo on a white or colored background and need a transparent PNG, you can usually fix it in a few seconds without opening a full design app.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 my-10 text-center">
        <Link href="/" className="inline-block bg-black text-white px-10 py-5 rounded-xl text-xl font-bold">
          Remove Logo Background Now
        </Link>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-4">Why transparent logos matter</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Websites and headers</li>
        <li>Canva and social graphics</li>
        <li>Merch and print files</li>
        <li>Product packaging and brand assets</li>
      </ul>

      <h2 className="text-2xl font-bold mt-12 mb-4">How to do it</h2>
      <ol className="list-decimal pl-6 space-y-2">
        <li>Upload your logo file</li>
        <li>Let the tool remove the background</li>
        <li>Download the transparent PNG</li>
      </ol>

      <p className="mt-6">
        This works especially well when you have a flat logo on a plain background and just need a quick clean version for web or marketing use.
      </p>

      <div className="text-center my-16">
        <Link href="/" className="inline-block bg-black text-white px-10 py-5 rounded-xl text-xl font-bold">
          Make Logo Transparent Free
        </Link>
      </div>
    </article>
  );
}
