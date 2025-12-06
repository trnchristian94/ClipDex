import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ClipsGrid } from "@/components/ClipsGrid";
import { Header } from "@/components/Header";

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
          visibility: "PUBLIC",
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

  // Formatear clips para el componente cliente
  const formattedClips = user.clips.map((clip) => ({
    ...clip,
    user: {
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
  }));

  const formattedFeaturedClips = featuredClips.map((clip) => ({
    ...clip,
    user: {
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}      
      <Header />

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
            <ClipsGrid clips={formattedFeaturedClips} />
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
            <ClipsGrid clips={formattedClips} title="All Clips" />
          </div>
        )}
      </div>
    </div>
  );
}