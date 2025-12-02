import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";
import { Readable } from "stream";

// IMPORTANTE: Sin esta config, Next.js limita a 4MB
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutos (Vercel Pro, para Hobby es 10s)

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obtener FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const game = formData.get("game") as string;
    const tags = formData.get("tags") as string;
    const visibility = formData.get("visibility") as string;
    const platformConnectionId = formData.get("platformConnectionId") as string;

    // Validaciones
    if (!file || !title || !game || !platformConnectionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validar tamaño (500MB max)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 500MB" },
        { status: 400 }
      );
    }

    console.log("📤 Upload request:", {
      filename: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      title,
      game,
    });

    // Obtener plataforma conectada
    const platform = await prisma.platformConnection.findUnique({
      where: { id: platformConnectionId },
    });

    if (!platform || platform.platform !== "YOUTUBE") {
      return NextResponse.json(
        { error: "YouTube platform not connected" },
        { status: 400 }
      );
    }

    // Configurar OAuth2 con los tokens del usuario
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/platforms/callback`
    );

    oauth2Client.setCredentials({
      access_token: platform.accessToken,
      refresh_token: platform.refreshToken || undefined,
    });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    // Convertir File a Buffer
    console.log("🔄 Converting file to buffer...");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convertir Buffer a Stream (requerido por Google API)
    const stream = Readable.from(buffer);

    // Procesar tags
    const tagArray = tags
      ? tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];
    tagArray.push(game); // Añadir el juego como tag

    console.log("☁️ Uploading to YouTube...");

    // Subir a YouTube con resumable upload (mejor para archivos grandes)
    const uploadResponse = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title,
          description: description || `${game} gameplay clip uploaded via ClipDex`,
          tags: tagArray,
          categoryId: "20", // Gaming category
        },
        status: {
          privacyStatus: visibility as "public" | "unlisted" | "private",
        },
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
    });

    const videoId = uploadResponse.data.id;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    console.log("✅ Uploaded to YouTube:", videoId);

    // Obtener información adicional del video
    const videoDetails = await youtube.videos.list({
      part: ["snippet", "contentDetails"],
      id: [videoId!],
    });

    const videoData = videoDetails.data.items?.[0];
    const thumbnailUrl =
      videoData?.snippet?.thumbnails?.maxres?.url ||
      videoData?.snippet?.thumbnails?.high?.url ||
      videoData?.snippet?.thumbnails?.default?.url ||
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    // Parsear duración (ISO 8601 format: PT1M30S → 90 segundos)
    const duration = parseDuration(
      videoData?.contentDetails?.duration || "PT0S"
    );

    console.log("💾 Saving to database...");

    // Guardar en base de datos
    const clip = await prisma.clip.create({
      data: {
        userId: platform.userId,
        platformConnectionId: platform.id,
        platform: "YOUTUBE",
        externalVideoId: videoId!,
        externalUrl: videoUrl,
        displayTitle: title,
        description: description || "",
        game,
        tags: tagArray,
        thumbnailUrl,
        duration,
        viewCount: 0,
        visibility: visibility.toUpperCase() as any,
      },
    });

    console.log("🎉 Clip created successfully:", clip.id);

    return NextResponse.json(
      {
        success: true,
        clip: {
          id: clip.id,
          videoId,
          url: videoUrl,
          thumbnailUrl,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("💥 Upload error:", error);

    // Manejar errores específicos de YouTube
    if (error.code === 403) {
      return NextResponse.json(
        {
          error:
            "YouTube API quota exceeded or permissions denied. Please try again later.",
        },
        { status: 403 }
      );
    }

    if (error.code === 401) {
      return NextResponse.json(
        {
          error:
            "YouTube authentication expired. Please reconnect your account.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || "Upload failed",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper: Convertir duración ISO 8601 a segundos
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  return hours * 3600 + minutes * 60 + seconds;
}