import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    const body = await req.json();
    const { projectId, studentId } = body;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // Determine student and founder IDs
    let finalStudentId: string;
    let finalFounderId: string;

    if (role === "STUDENT") {
      finalStudentId = userId;
      // Look up the founder from the project
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { founderId: true },
      });
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      finalFounderId = project.founderId;
    } else if (role === "FOUNDER") {
      if (!studentId) {
        return NextResponse.json({ error: "studentId is required for founders" }, { status: 400 });
      }
      finalFounderId = userId;
      finalStudentId = studentId;

      // Verify the project belongs to this founder
      const project = await prisma.project.findFirst({
        where: { id: projectId, founderId: userId },
      });
      if (!project) {
        return NextResponse.json({ error: "Project not found or not yours" }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check for existing connection
    const existing = await prisma.connection.findFirst({
      where: {
        studentId: finalStudentId,
        projectId,
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Connection already exists" }, { status: 409 });
    }

    // Create the connection
    const connection = await prisma.connection.create({
      data: {
        studentId: finalStudentId,
        founderId: finalFounderId,
        projectId,
        status: "PENDING",
      },
    });

    // Notify the recipient
    const recipientId = role === "STUDENT" ? finalFounderId : finalStudentId;
    const senderName = session.user.name || "Someone";

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: "CONNECTION_REQUEST",
        message: `${senderName} wants to connect on a project`,
        link: role === "STUDENT" ? "/dashboard" : `/projects/${projectId}`,
      },
    });

    return NextResponse.json(connection);
  } catch (error) {
    console.error("Connection creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    if (role !== "FOUNDER") {
      return NextResponse.json({ error: "Only founders can accept/reject connections" }, { status: 403 });
    }

    const body = await req.json();
    const { connectionId, status } = body;

    if (!connectionId || !["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "connectionId and valid status required" }, { status: 400 });
    }

    // Verify the connection belongs to this founder
    const connection = await prisma.connection.findFirst({
      where: { id: connectionId, founderId: userId },
      include: { student: { select: { name: true } }, project: { select: { title: true } } },
    });

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // Update the connection status
    const updated = await prisma.connection.update({
      where: { id: connectionId },
      data: { status },
    });

    // If accepted, create a DirectChat for this project (if not exists)
    if (status === "ACCEPTED") {
      const existingChat = await prisma.directChat.findUnique({
        where: { projectId: connection.projectId },
      });

      if (!existingChat) {
        await prisma.directChat.create({
          data: { projectId: connection.projectId },
        });
      }
    }

    // Notify the student
    const statusText = status === "ACCEPTED" ? "accepted" : "declined";
    await prisma.notification.create({
      data: {
        userId: connection.studentId,
        type: status === "ACCEPTED" ? "ACCEPTED" : "REJECTED",
        message: `Your connection request for "${connection.project.title}" was ${statusText}`,
        link: status === "ACCEPTED" ? `/chat/direct/${connection.projectId}` : "/matches",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Connection update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    let connections;
    if (role === "FOUNDER") {
      connections = await prisma.connection.findMany({
        where: { founderId: userId },
        include: {
          student: { select: { id: true, name: true, email: true, avatar: true, skills: true } },
          project: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      connections = await prisma.connection.findMany({
        where: { studentId: userId },
        include: {
          founder: { select: { id: true, name: true, company: true, avatar: true } },
          project: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(connections);
  } catch (error) {
    console.error("Fetch connections error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
