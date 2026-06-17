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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, coverLetter } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        projectId,
        studentId: (session.user as any).id,
      },
    });

    if (existingApplication) {
      return NextResponse.json({ error: "Already applied to this project" }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        projectId,
        studentId: (session.user as any).id,
        coverLetter,
        status: "PENDING",
      },
      include: {
        project: {
          include: { founder: true },
        },
      },
    });

    // Notify Founder
    if (application.project?.founder?.email) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || "noreply@ibf.com",
          to: application.project.founder.email,
          subject: "New Application Received - IBF",
          text: `You have received a new application for your project "${application.project.title}". Log in to your dashboard to review it.`,
        });
      } catch (err) {
        console.error("Failed to send email notification", err);
      }
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Application error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
