import { NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/platforms?error=missing_code`
    );
  }

  try {
    const { userId, platform } = JSON.parse(state);

    // Intercambiar código por tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/platforms/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Obtener info del canal de YouTube
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const channelResponse = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
    });

    const channel = channelResponse.data.items?.[0];

    if (!channel) {
      throw new Error("No YouTube channel found");
    }

    // Guardar en BD
    await prisma.platformConnection.upsert({
      where: {
        userId_platform: {
          userId,
          platform,
        },
      },
      create: {
        userId,
        platform,
        platformUserId: channel.id!,
        platformUsername: channel.snippet?.customUrl || "",
        channelName: channel.snippet?.title || "",
        channelUrl: `https://youtube.com/channel/${channel.id}`,
        avatarUrl: channel.snippet?.thumbnails?.default?.url || "",
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || "",
        expiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : undefined,
      },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || "",
        expiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : undefined,
        lastSyncAt: new Date(),
      },
    });

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/platforms?success=true`
    );
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/platforms?error=${encodeURIComponent(
        error.message
      )}`
    );
  }
}