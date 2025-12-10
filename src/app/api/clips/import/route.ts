import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platformConnectionId, videos } = await req.json();

    if (!platformConnectionId || !videos || videos.length === 0) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const platform = await prisma.platformConnection.findUnique({
      where: { id: platformConnectionId },
    });

    if (!platform) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 }
      );
    }

    // Verificar que el usuario es el dueño
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (platform.userId !== user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Importar clips
    const imported = [];
    for (const video of videos) {
      // Verificar si ya existe
      const existing = await prisma.clip.findUnique({
        where: {
          platform_externalVideoId: {
            platform: "YOUTUBE",
            externalVideoId: video.externalVideoId,
          },
        },
      });

      if (existing) {
        continue; // Skip si ya existe
      }

      const clip = await prisma.clip.create({
        data: {
          userId: platform.userId,
          platformConnectionId: platform.id,
          platform: "YOUTUBE",
          externalVideoId: video.externalVideoId,
          externalUrl: `https://www.youtube.com/watch?v=${video.externalVideoId}`,
          displayTitle: video.displayTitle,
          description: video.description || "",
          game: video.game,
          tags: video.tags,
          thumbnailUrl: video.thumbnailUrl,
          duration: 0, // TODO: Parsear duration
          viewCount: 0,
          youtubeVisibility: "UNLISTED", // Asumimos unlisted
          visibility: "PUBLIC",
          publishedAt: new Date(video.publishedAt),
        },
      });

      imported.push(clip);
    }

    return NextResponse.json({ success: true, imported: imported.length });
  } catch (error: any) {
    console.error("Import clips error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import clips" },
      { status: 500 }
    );
  }
}