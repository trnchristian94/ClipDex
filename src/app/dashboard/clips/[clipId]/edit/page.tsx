import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { EditClipForm } from "@/components/EditClipForm";
import { Header } from "@/components/Header";

interface EditClipPageProps {
  params: Promise<{
    clipId: string;
  }>;
}

export default async function EditClipPage({ params }: EditClipPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const { clipId } = await params;

  const clip = await prisma.clip.findUnique({
    where: { id: clipId },
    include: {
      user: true,
    },
  });

  if (!clip) {
    notFound();
  }

  // Verificar que el clip pertenece al usuario
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (clip.userId !== user?.id) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Clip</h1>
          <p className="text-gray-400">Update your clip information</p>
        </div>

        <EditClipForm clip={clip} />
      </div>
    </div>
  );
}
