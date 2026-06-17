import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "FOUNDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: {
        founderId: (session.user as any).id,
      },
      include: {
        applications: {
          include: {
            student: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
