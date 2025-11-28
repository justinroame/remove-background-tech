// app/admin/page.tsx
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PASSWORD = "Poop4lifeyo!"; // Change this anytime

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { pass?: string };
}) {
  // Password protection
  if (searchParams.pass !== PASSWORD) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-6xl font-black">Wrong password</h1>
      </div>
    );
  }

  // Fetch all users
  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      credits: users.totalCredits,
      pro: users.pro,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(300);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black text-white p-8 md:p-16 font-mono">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-6xl font-black mb-8 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
          Secret Admin Panel
        </h1>
        <p className="text-2xl mb-12 text-gray-300">{allUsers.length} total users</p>

        <div className="space-y-6">
          {allUsers.map((user) => (
            <div
              key={user.id}
              className="bg-gray-900/70 backdrop-blur border border-gray-800 rounded-3xl p-8 flex justify-between items-center hover:border-cyan-500 transition"
            >
              <div>
                <div className="text-3xl font-bold">{user.email}</div>
                <div className="text-gray-400 mt-2">
                  Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                  {user.pro && <span className="ml-4 text-yellow-400 font-bold">PRO</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-6xl font-black text-cyan-400">
                  {user.credits ?? 0}
                </div>
                <div className="text-xl text-gray-500">credits</div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Credits Form */}
        <div className="mt-16 bg-gray-900/50 rounded-3xl p-8 border border-gray-800">
          <h2 className="text-3xl font-bold mb-6">Add Credits</h2>
          <form action="/api/admin-actions/add-credits" method="POST" className="flex gap-4 flex-wrap">
            <input
              name="email"
              type="email"
              placeholder="user@example.com"
              required
              className="px-6 py-4 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 flex-1 min-w-64"
            />
            <input
              name="amount"
              type="number"
              placeholder="1000"
              required
              min="1"
              className="px-6 py-4 bg-black border border-gray-700 rounded-xl text-white w-32"
            />
            <input type="hidden" name="pass" value={PASSWORD} />
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold hover:opacity-90 transition"
            >
              Give Credits
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}