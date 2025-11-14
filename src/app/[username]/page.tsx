import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // ✅ Await params primero
  const { username } = await params;
  
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      clips: {
        where: { visibility: "PUBLIC" },
        orderBy: { uploadedAt: "desc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const totalViews = user.clips.reduce((acc, clip) => acc + clip.viewCount, 0);
  const games = new Set(user.clips.map((c) => c.game));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <a href="/" className="text-2xl font-bold">
            🎮 <span className="text-purple-400">ClipDex</span>
          </a>
        </div>
      </header>

      {/* Profile Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-6 mb-8">
          <img
            src={user.avatarUrl || "/default-avatar.png"}
            alt={user.displayName}
            className="w-24 h-24 rounded-full border-4 border-purple-500"
          />
          <div>
            <h1 className="text-4xl font-bold mb-2">{user.displayName}</h1>
            <p className="text-gray-400 mb-3">@{user.username}</p>
            {user.bio && <p className="text-gray-300">{user.bio}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl">
          <div className="bg-slate-800/50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-400">
              {user.clips.length}
            </div>
            <div className="text-sm text-gray-400">Clips</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-400">{totalViews}</div>
            <div className="text-sm text-gray-400">Total Views</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">
              {games.size}
            </div>
            <div className="text-sm text-gray-400">Games</div>
          </div>
        </div>

        {/* Clips Grid */}
        {user.clips.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-bold mb-2">No clips yet</h3>
            <p className="text-gray-400">
              This user hasn't uploaded any clips yet
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">Clips</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.clips.map((clip) => (
                <div
                  key={clip.id}
                  className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden hover:border-purple-500 transition cursor-pointer"
                >
                  <div className="relative aspect-video bg-slate-900">
                    <iframe
                      src={`https://www.youtube.com/embed/${clip.youtubeVideoId}`}
                      title={clip.displayTitle}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-1">{clip.displayTitle}</h3>
                    <p className="text-sm text-gray-400 mb-2">{clip.game}</p>
                    {clip.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {clip.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      👁️ {clip.viewCount} views •{" "}
                      {new Date(clip.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}