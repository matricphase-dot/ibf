import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");

    // Auto-create chat room if it doesn't exist yet
    let chat = await prisma.directChat.findUnique({
      where: { projectId },
    });

    if (!chat) {
      // Verify the project exists before creating a chat
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      chat = await prisma.directChat.create({
        data: { projectId },
      });
    }

    const messages = await prisma.directMessage.findMany({
      where: { chatId: chat.id },
      take: 20,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
      include: { sender: { select: { name: true, id: true } } },
    });

    const nextCursor = messages.length === 20 ? messages[19].id : null;

    return NextResponse.json({ messages: messages.reverse(), nextCursor });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    const { text, receiverId } = await req.json();

    // Auto-create chat room if it doesn't exist yet
    let chat = await prisma.directChat.findUnique({
      where: { projectId },
    });

    if (!chat) {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      chat = await prisma.directChat.create({
        data: { projectId },
      });
    }

    const message = await prisma.directMessage.create({
      data: {
        text,
        chatId: chat.id,
        senderId: (session.user as any).id,
        receiverId: receiverId || (session.user as any).id,
      },
      include: { sender: { select: { name: true, id: true } } },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Direct message error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
