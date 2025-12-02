import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ConnectPlatformButton } from "@/components/ConnectPlatformButton";
import { ReconnectButton } from "@/components/ReconnectButton";
import { DisconnectButton } from "@/components/DisconnectButton";

export default async function PlatformsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      platforms: true,
    },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  const platforms = [
    {
      id: "YOUTUBE",
      name: "YouTube",
      icon: "🎥",
      color: "from-red-500 to-red-600",
      description: "Upload clips directly to your YouTube channel",
      available: true,
    },
    {
      id: "TWITCH",
      name: "Twitch",
      icon: "🟣",
      color: "from-purple-500 to-purple-600",
      description: "Import clips and VODs from your Twitch channel",
      available: false,
    },
    {
      id: "VIMEO",
      name: "Vimeo",
      icon: "🎬",
      color: "from-blue-500 to-blue-600",
      description: "Upload to Vimeo for professional hosting",
      available: false,
    },
  ];

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
              href="/dashboard"
              className="text-gray-300 hover:text-white transition cursor-pointer"
            >
              Dashboard
            </Link>
            <span className="text-gray-300">{user.displayName}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Connected Platforms</h1>
          <p className="text-gray-400">
            Connect your video platforms to start uploading clips
          </p>
        </div>

        {/* Platforms Grid */}
        <div className="space-y-4">
          {platforms.map((platform) => {
            const connected = user.platforms.find(
              (p) => p.platform === platform.id
            );

            return (
              <div
                key={platform.id}
                className="bg-slate-800/50 rounded-lg border border-slate-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-16 h-16 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center text-3xl flex-shrink-0`}
                    >
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">
                        {platform.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-3">
                        {platform.description}
                      </p>
                      {connected && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-green-400">● Connected</span>
                          </div>
                          {connected.channelName && (
                            <p className="text-sm text-gray-400">
                              Channel: {connected.channelName}
                            </p>
                          )}
                          {connected.lastSyncAt && (
                            <p className="text-xs text-gray-500">
                              Last synced:{" "}
                              {new Date(connected.lastSyncAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!platform.available ? (
                      <span className="px-4 py-2 bg-slate-700 text-gray-400 rounded-lg text-sm">
                        Coming Soon
                      </span>
                    ) : connected ? (
                      <>
                        <ReconnectButton
                          platform={platform.id as any}
                        />
                        <DisconnectButton
                          platformConnectionId={connected.id}
                          platformName={platform.name}
                        />
                      </>
                    ) : (
                      <ConnectPlatformButton
                        platform={platform.id as any}
                        userId={user.id}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-purple-900/20 border border-purple-500/50 rounded-lg p-6">
          <h4 className="font-bold mb-2 flex items-center gap-2">
            🔒 Your Data, Your Control
          </h4>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Videos are uploaded to YOUR accounts, not ours</li>
            <li>• We only store metadata (title, tags, thumbnail URL)</li>
            <li>• You can disconnect at any time</li>
            <li>• Your credentials are encrypted and secure</li>
            <li>
              • Disconnecting removes access but doesn't delete videos from your
              channel
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}