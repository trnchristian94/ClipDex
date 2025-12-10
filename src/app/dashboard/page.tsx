import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { ClipsGrid } from "@/components/ClipsGrid";
import { Header } from "@/components/Header";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      clips: {
        orderBy: { uploadedAt: "desc" },
        take: 10,
      },
      platforms: true,
    },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  const formattedClips = user.clips.map((clip) => ({
    ...clip,
    user: {
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
  }));

  const hasYouTube = user.platforms.some((p) => p.platform === "YOUTUBE");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <div className="text-3xl mb-2">📹</div>
            <div className="text-3xl font-bold text-purple-400">
              {user.clips.length}
            </div>
            <div className="text-sm text-gray-400">Total Clips</div>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <div className="text-3xl mb-2">👁️</div>
            <div className="text-3xl font-bold text-blue-400">
              {user.clips.reduce((acc, clip) => acc + clip.viewCount, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Views</div>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <div className="text-3xl mb-2">🎮</div>
            <div className="text-3xl font-bold text-green-400">
              {new Set(user.clips.map((c) => c.game)).size}
            </div>
            <div className="text-sm text-gray-400">Games</div>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-yellow-400">
              {user.clips.filter((c) => c.isFeatured).length}
            </div>
            <div className="text-sm text-gray-400">Featured</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          {hasYouTube ? (
            <div>
              <Link
                href="/dashboard/upload"
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 mr-2 rounded-lg font-semibold transition cursor-pointer"
              >
                📤 Upload New Clip
              </Link>
              <Link
                href="/dashboard/import"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition cursor-pointer"
              >
                📥 Import from YouTube
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="bg-yellow-900/20 border border-yellow-600 px-6 py-3 rounded-lg">
                <span className="text-yellow-400">
                  ⚠️ Connect YouTube to upload clips
                </span>
              </div>
              <Link
                href="/dashboard/platforms"
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition cursor-pointer"
              >
                Connect Platform
              </Link>
            </div>
          )}
        </div>

        {/* Clips List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Clips</h2>

          {user.clips.length === 0 ? (
            <div className="bg-slate-800/50 p-12 rounded-lg border border-slate-700 text-center">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-bold mb-2">No clips yet</h3>
              <p className="text-gray-400 mb-6">
                Upload your first gaming highlight to get started
              </p>
              {hasYouTube ? (
                <Link
                  href="/dashboard/upload"
                  className="inline-block bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition cursor-pointer"
                >
                  Upload Your First Clip
                </Link>
              ) : (
                <Link
                  href="/dashboard/platforms"
                  className="inline-block bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition cursor-pointer"
                >
                  Connect YouTube First
                </Link>
              )}
            </div>
          ) : (
            <ClipsGrid clips={formattedClips} />
          )}
        </div>
      </div>
    </div>
  );
}
