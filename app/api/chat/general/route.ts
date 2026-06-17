import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");

    const messages = await prisma.generalMessage.findMany({
      take: 20,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, avatar: true } } },
    });
    
    const nextCursor = messages.length === 20 ? messages[19].id : null;
    
    return NextResponse.json({ messages: messages.reverse(), nextCursor });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });

    const message = await prisma.generalMessage.create({
      data: {
        text,
        userId: (session.user as any).id,
      },
      include: { user: { select: { name: true, avatar: true } } },
    });

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
