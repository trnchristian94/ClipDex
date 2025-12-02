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

    const { platformConnectionId } = await req.json();

    if (!platformConnectionId) {
      return NextResponse.json(
        { error: "Platform connection ID required" },
        { status: 400 }
      );
    }

    // Verificar que la plataforma pertenece al usuario
    const platform = await prisma.platformConnection.findUnique({
      where: { id: platformConnectionId },
    });

    if (!platform) {
      return NextResponse.json(
        { error: "Platform connection not found" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (platform.userId !== user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Eliminar la conexión
    await prisma.platformConnection.delete({
      where: { id: platformConnectionId },
    });

    console.log("✅ Platform disconnected:", platformConnectionId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("💥 Disconnect error:", error);
    return NextResponse.json(
      { error: error.message || "Disconnect failed" },
      { status: 500 }
    );
  }
}