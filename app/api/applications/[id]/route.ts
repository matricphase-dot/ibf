import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.example.com",
  port: Number(process.env.EMAIL_SERVER_PORT) || 587,
  auth: {
    user: process.env.EMAIL_SERVER_USER || "user",
    pass: process.env.EMAIL_SERVER_PASSWORD || "pass",
  },
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "FOUNDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { project: true, student: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.project.founderId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status },
    });

    // Create DirectChat if accepted
    if (status === "ACCEPTED") {
      await prisma.directChat.upsert({
        where: { projectId: application.projectId },
        update: {},
        create: {
          projectId: application.projectId,
        },
      });

      // Notify Student
      if (application.student?.email) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || "noreply@ibf.com",
            to: application.student.email,
            subject: "Application Accepted - IBF",
            text: `Congratulations! Your application for "${application.project.title}" was accepted. Log in to access the private project chat.`,
          });
        } catch (err) {
          console.error("Failed to send acceptance email", err);
        }
      }
    }

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("Application update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
