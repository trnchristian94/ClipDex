import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UploadForm } from "@/components/UploadForm";

export default async function UploadPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      platforms: {
        where: { isActive: true },
      },
    },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  const youtubePlatform = user.platforms.find((p) => p.platform === "YOUTUBE");

  if (!youtubePlatform) {
    redirect("/dashboard/platforms");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold">
            🎮 <span className="text-purple-400">ClipDex</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-gray-300 hover:text-white transition cursor-pointer"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload New Clip</h1>
          <p className="text-gray-400">
            Upload to your YouTube channel: {youtubePlatform.channelName}
          </p>
        </div>

        <UploadForm
          userId={user.id}
          platformConnectionId={youtubePlatform.id}
        />
      </div>
    </div>
  );
}