import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const platformConnectionId = searchParams.get("platformConnectionId");

    if (!platformConnectionId) {
      return NextResponse.json(
        { error: "Platform connection ID required" },
        { status: 400 }
      );
    }

    // Obtener plataforma
    const platform = await prisma.platformConnection.findUnique({
      where: { id: platformConnectionId },
    });

    if (!platform) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 }
      );
    }

    // Configurar OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: platform.accessToken,
      refresh_token: platform.refreshToken || undefined,
    });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    // Obtener videos del canal
    const response = await youtube.search.list({
      part: ["snippet"],
      forMine: true,
      type: ["video"],
      maxResults: 50,
      order: "date",
    });

    const videoIds =
      response.data.items?.map((item) => item.id?.videoId).filter(Boolean) ||
      [];

    if (videoIds.length === 0) {
      return NextResponse.json({ videos: [] });
    }

    // Obtener detalles completos
    const detailsResponse = await youtube.videos.list({
      part: ["snippet", "contentDetails"],
      id: videoIds as string[],
    });

    const videos = detailsResponse.data.items?.map((video) => ({
      id: video.id,
      title: video.snippet?.title,
      description: video.snippet?.description,
      thumbnailUrl:
        video.snippet?.thumbnails?.medium?.url ||
        video.snippet?.thumbnails?.default?.url,
      publishedAt: video.snippet?.publishedAt,
      duration: video.contentDetails?.duration,
    }));

    return NextResponse.json({ videos });
  } catch (error: any) {
    console.error("Fetch YouTube videos error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch videos" },
      { status: 500 }
    );
  }
}