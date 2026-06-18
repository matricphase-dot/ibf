import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "FOUNDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      requiredSkills,
      deadline,
      domain,
      stage,
      problemStatement,
      solutionOverview,
      equity,
      stipend,
      engagementType,
      commitmentHours,
      duration,
      milestones,
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        requiredSkills: requiredSkills || [],
        deadline: deadline ? new Date(deadline) : null,
        founderId: (session.user as any).id,
        domain: domain || null,
        stage: stage || null,
        problemStatement: problemStatement || null,
        solutionOverview: solutionOverview || null,
        equity: equity || null,
        stipend: stipend || null,
        engagementType: engagementType || null,
        commitmentHours: commitmentHours ? Number(commitmentHours) : null,
        duration: duration ? Number(duration) : null,
        milestones: milestones || [],
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Project creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");

    const projects = await prisma.project.findMany({
      take: 10,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        founder: {
          select: {
            name: true,
            company: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    const nextCursor = projects.length === 10 ? projects[9].id : null;

    return NextResponse.json({ projects, nextCursor });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
