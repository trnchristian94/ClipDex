import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";
import { prisma } from "@/lib/prisma";

export async function Header() {
  const session = await getServerSession(authOptions);

  // Obtener el username del usuario logueado
  let username = null;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { username: true },
    });
    username = user?.username;
  }

  return (
    <header className="border-b border-slate-700 bg-slate-900/50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={session ? "/dashboard" : "/"} className="text-2xl font-bold">
          🎮 <span className="text-purple-400">ClipDex</span>
        </Link>

        {session ? (
          // Usuario logueado
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-300 hover:text-white transition cursor-pointer"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/platforms"
              className="text-gray-300 hover:text-white transition cursor-pointer"
            >
              Platforms
            </Link>
            {username && (
              <Link
                href={`/${username}`}
                className="text-gray-300 hover:text-white transition cursor-pointer"
              >
                View Profile
              </Link>
            )}
            <SignOutButton />
          </div>
        ) : (
          // Usuario NO logueado
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-300 hover:text-white transition cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
