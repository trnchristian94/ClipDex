import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

// PATCH - Actualizar clip
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ clipId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clipId } = await context.params;
    const body = await req.json();

    console.log("📝 Updating clip:", clipId);

    // Verificar que el clip existe y pertenece al usuario
    const clip = await prisma.clip.findUnique({
      where: { id: clipId },
    });

    if (!clip) {
      return NextResponse.json({ error: "Clip not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (clip.userId !== user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Actualizar
    const updatedClip = await prisma.clip.update({
      where: { id: clipId },
      data: {
        displayTitle: body.displayTitle,
        description: body.description,
        game: body.game,
        tags: body.tags,
        isFeatured: body.isFeatured,
        visibility: body.visibility,
      },
    });

    console.log("✅ Clip updated successfully");

    return NextResponse.json({ success: true, clip: updatedClip });
  } catch (error: any) {
    console.error("💥 Update clip error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update clip" },
      { status: 500 }
    );
  }
}

// DELETE - Borrar clip
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ clipId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clipId } = await context.params;
    
    // Leer el body si existe (para deleteFromYouTube)
    let body: any = {};
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (e) {
      // Si no hay body o no es JSON, continuar
    }

    const deleteFromYouTube = body.deleteFromYouTube || false;

    console.log("🗑️ Deleting clip:", clipId, { deleteFromYouTube });

    // Verificar que el clip existe y pertenece al usuario
    const clip = await prisma.clip.findUnique({
      where: { id: clipId },
      include: {
        platformConnection: true,
      },
    });

    if (!clip) {
      return NextResponse.json({ error: "Clip not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (clip.userId !== user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Si el usuario quiere borrar también de YouTube
    if (deleteFromYouTube && clip.platform === "YOUTUBE") {
      try {
        console.log("🎥 Attempting to delete from YouTube...");

        // Configurar OAuth2
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          `${process.env.NEXTAUTH_URL}/api/platforms/callback`
        );

        oauth2Client.setCredentials({
          access_token: clip.platformConnection.accessToken,
          refresh_token: clip.platformConnection.refreshToken || undefined,
        });

        const youtube = google.youtube({
          version: "v3",
          auth: oauth2Client,
        });

        // Borrar de YouTube
        await youtube.videos.delete({
          id: clip.externalVideoId,
        });

        console.log("✅ Video deleted from YouTube:", clip.externalVideoId);
      } catch (error: any) {
        console.error("❌ Failed to delete from YouTube:", error);
        
        // Si falla el borrado de YouTube, devolver error pero NO borrar de BD
        return NextResponse.json(
          {
            error: "Failed to delete from YouTube: " + error.message,
            code: "YOUTUBE_DELETE_FAILED",
          },
          { status: 500 }
        );
      }
    }

    // Borrar de BD (solo si YouTube deletion fue exitoso o no se requirió)
    await prisma.clip.delete({
      where: { id: clipId },
    });

    console.log("✅ Clip deleted from database");

    return NextResponse.json({
      success: true,
      deletedFromYouTube: deleteFromYouTube,
    });
  } catch (error: any) {
    console.error("💥 Delete clip error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete clip" },
      { status: 500 }
    );
  }
}