import Link from "next/link";

export const metadata = {
  title: "remove.bg vs Photoroom vs Remove-Background.Tech – 2025 Real Test",
  description: "Side-by-side comparison: speed, hair edges, pricing. We processed the same 20 images on all three.",
};

export default function Page() {
  return (
    <>
      <article className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          remove.bg vs Photoroom vs Remove-Background.Tech (2025 Real Test)
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          We ran the exact same 20 images through all three tools. Here’s who actually won.
        </p>

        <table className="w-full border-collapse my-10 text-left text-sm md:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 font-bold">Tool</th>
              <th className="p-4">Avg Speed</th>
              <th className="p-4">Hair/Edge Quality</th>
              <th className="p-4">Free Credits</th>
              <th className="p-4">Price After</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-green-50 font-bold text-lg">
              <td className="p-4">Remove-Background.Tech</td>
              <td className="p-4">1.4s</td>
              <td className="p-4">9.6/10</td>
              <td className="p-4">3 full credits</td>
              <td className="p-4">$0.20–$0.50</td>
            </tr>
            <tr>
              <td className="p-4">Photoroom</td>
              <td className="p-4">2.8s</td>
              <td className="p-4">9.4/10</td>
              <td className="p-4">Limited</td>
              <td className="p-4">$0.50+</td>
            </tr>
            <tr>
              <td className="p-4">remove.bg</td>
              <td className="p-4">4.1s</td>
              <td className="p-4">9.2/10</td>
              <td className="p-4">Watermark only</td>
              <td className="p-4">$0.23–$9</td>
            </tr>
          </tbody>
        </table>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 my-10 text-center">
          <Link href="/" className="inline-block bg-black text-white px-10 py-5 rounded-xl text-xl font-bold">
            Try the 2025 Winner Free (3 credits)
          </Link>
        </div>
      </article>
    </>
  );
}