import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      clips: {
        where: { 
          visibility: "PUBLIC" // ✅ Solo clips públicos
        },
        orderBy: { uploadedAt: "desc" },
      },
      platforms: {
        where: { isActive: true },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const totalViews = user.clips.reduce((acc, clip) => acc + clip.viewCount, 0);
  const games = new Set(user.clips.map((c) => c.game));
  const featuredClips = user.clips.filter((c) => c.isFeatured);

  // Agrupar clips por juego
  const clipsByGame = user.clips.reduce((acc, clip) => {
    if (!acc[clip.game]) acc[clip.game] = [];
    acc[clip.game].push(clip);
    return acc;
  }, {} as Record<string, typeof user.clips>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold">
            🎮 <span className="text-purple-400">ClipDex</span>
          </Link>
        </div>
      </header>

      {/* Profile Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          {/* Avatar */}
          <div className="relative">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.displayName}
                width={96}
                height={96}
                className="rounded-full border-4 border-purple-500"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-purple-500 bg-slate-700 flex items-center justify-center text-3xl">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{user.displayName}</h1>
            <p className="text-gray-400 mb-3">@{user.username}</p>
            {user.bio && <p className="text-gray-300 mb-4">{user.bio}</p>}

            {/* Connected Platforms */}
            {user.platforms.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-400">Connected:</span>
                {user.platforms.map((platform) => (
                  <div
                    key={platform.id}
                    className="flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-full text-sm"
                  >
                    {platform.platform === "YOUTUBE" && "🎥"}
                    {platform.platform === "TWITCH" && "🟣"}
                    {platform.platform === "VIMEO" && "🎬"}
                    <span>{platform.platform}</span>
                  </div>
                ))}
              </div>
            )}
            {user.website && (
              <Link
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:underline text-sm"
              >
                🔗 {user.website}
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-800/50 p-4 rounded-lg text-center border border-slate-700">
            <div className="text-3xl font-bold text-purple-400">
              {user.clips.length}
            </div>
            <div className="text-sm text-gray-400">Clips</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg text-center border border-slate-700">
            <div className="text-3xl font-bold text-blue-400">{totalViews}</div>
            <div className="text-sm text-gray-400">Total Views</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg text-center border border-slate-700">
            <div className="text-3xl font-bold text-green-400">
              {games.size}
            </div>
            <div className="text-sm text-gray-400">Games</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg text-center border border-slate-700">
            <div className="text-3xl font-bold text-yellow-400">
              {featuredClips.length}
            </div>
            <div className="text-sm text-gray-400">Featured</div>
          </div>
        </div>

        {/* Featured Clips */}
        {featuredClips.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              ⭐ Featured Clips
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredClips.map((clip) => (
                <ClipCard key={clip.id} clip={clip} />
              ))}
            </div>
          </div>
        )}

        {/* All Clips */}
        {user.clips.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-bold mb-2">No clips yet</h3>
            <p className="text-gray-400">
              This user hasn't uploaded any public clips yet
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">All Clips</h2>

            {/* Filter by Game */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button className="px-4 py-2 bg-purple-600 rounded-lg text-sm font-semibold cursor-pointer">
                All ({user.clips.length})
              </button>
              {Array.from(games).map((game) => (
                <button
                  key={game}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition cursor-pointer"
                >
                  {game} ({clipsByGame[game].length})
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.clips.map((clip) => (
                <ClipCard key={clip.id} clip={clip} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente ClipCard
function ClipCard({ clip }: { clip: any }) {
  const platformColors = {
    YOUTUBE: "bg-red-600",
    TWITCH: "bg-purple-600",
    VIMEO: "bg-blue-600",
  };

  const platformIcons = {
    YOUTUBE: "🎥",
    TWITCH: "🟣",
    VIMEO: "🎬",
  };

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden hover:border-purple-500 transition group cursor-pointer">
      <div className="relative aspect-video bg-slate-900">
        {/* Thumbnail */}
        <Image
          src={clip.thumbnailUrl}
          alt={clip.displayTitle}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-semibold">
          {Math.floor(clip.duration / 60)}:
          {(clip.duration % 60).toString().padStart(2, "0")}
        </div>

        {/* Platform badge */}
        <div
          className={`absolute top-2 left-2 ${
            platformColors[clip.platform as keyof typeof platformColors]
          } px-2 py-1 rounded text-xs flex items-center gap-1 font-semibold`}
        >
          {platformIcons[clip.platform as keyof typeof platformIcons]}
          {clip.platform}
        </div>

        {/* Featured badge */}
        {clip.isFeatured && (
          <div className="absolute top-2 right-2 bg-yellow-500 px-2 py-1 rounded text-xs flex items-center gap-1 font-semibold text-black">
            ⭐ Featured
          </div>
        )}

        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-[20px] border-l-black border-y-[12px] border-y-transparent ml-1"></div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold mb-1 truncate group-hover:text-purple-400 transition">
          {clip.displayTitle}
        </h3>
        <p className="text-sm text-gray-400 mb-2">{clip.game}</p>

        {/* Tags */}
        {clip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {clip.tags.slice(0, 3).map((tag: string, i: number) => (
              <span
                key={i}
                className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {clip.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{clip.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            👁️ {clip.viewCount.toLocaleString()} views
          </span>
          <span>{new Date(clip.uploadedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}