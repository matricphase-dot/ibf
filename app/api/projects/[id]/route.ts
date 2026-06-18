import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: any }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        founder: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            company: true,
            bio: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let connection = null;
    if (userId && role === "STUDENT") {
      connection = await prisma.connection.findFirst({
        where: {
          projectId: id,
          studentId: userId,
        },
      });
    }

    return NextResponse.json({ project, connection });
  } catch (error) {
    console.error("Fetch project error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
