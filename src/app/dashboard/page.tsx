import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Si no está logueado, redirigir a login
  if (!session?.user) {
    redirect("/login");
  }

  // Obtener datos del usuario desde la BD
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      clips: {
        orderBy: { uploadedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            🎮 <span className="text-purple-400">ClipDex</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">{user.displayName}</span>
            <img
              src={user.avatarUrl || "/default-avatar.png"}
              alt={user.displayName}
              className="w-10 h-10 rounded-full"
            />
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
        <div className="flex items-center gap-4">
        <a 
            href={`/${user.username}`}
            className="text-gray-300 hover:text-purple-400 transition"
        >
            👁️ View Public Profile
        </a>
        <span className="text-gray-300">{user.displayName}</span>
        <img
            src={user.avatarUrl || "/default-avatar.png"}
            alt={user.displayName}
            className="w-10 h-10 rounded-full"
        />
        <SignOutButton />
        </div>
        <Link
          href="/dashboard/platforms"
          className="text-gray-300 hover:text-purple-400 transition"
        >
          Connect Platforms
        </Link>
        

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
              <button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition">
                Upload Your First Clip
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.clips.map((clip) => (
                <div
                  key={clip.id}
                  className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden hover:border-purple-500 transition"
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