import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

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

  const hasYouTube = user.platforms.some((p) => p.platform === "YOUTUBE");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold">
            🎮 <span className="text-purple-400">ClipDex</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/platforms"
              className="text-gray-300 hover:text-purple-400 transition cursor-pointer"
            >
              Platforms
            </Link>
            <Link
              href={`/${user.username}`}
              className="text-gray-300 hover:text-purple-400 transition cursor-pointer"
            >
              View Profile
            </Link>
            <span className="text-gray-300">{user.displayName}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

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
            <Link
              href="/dashboard/upload"
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition cursor-pointer"
            >
              📤 Upload New Clip
            </Link>
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

          <Link
            href={`/${user.username}`}
            target="_blank"
            className="border border-purple-400 hover:bg-purple-900/30 px-6 py-3 rounded-lg font-semibold transition cursor-pointer"
          >
            👁️ View Public Profile
          </Link>
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.clips.map((clip) => (
                <div
                  key={clip.id}
                  className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden hover:border-purple-500 transition cursor-pointer"
                >
                  <div className="relative aspect-video bg-slate-900">
                    <img
                      src={clip.thumbnailUrl}
                      alt={clip.displayTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs">
                      {Math.floor(clip.duration / 60)}:
                      {(clip.duration % 60).toString().padStart(2, "0")}
                    </div>
                    <div className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                      🎥 {clip.platform}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-1 truncate">
                      {clip.displayTitle}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">{clip.game}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>👁️ {clip.viewCount} views</span>
                      <span>
                        {new Date(clip.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}