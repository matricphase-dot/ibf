import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      email, password, name, role,
      skills, interests, goals, portfolioUrl, // Student
      pastVentures, availability, // Founder
      project // Founder Project
    } = data;

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        skills: skills || [],
        interests: interests || [],
        goals: goals || null,
        portfolioUrl: portfolioUrl || null,
        pastVentures: pastVentures || null,
        availability: availability || null,
      },
    });

    if (role === "FOUNDER" && project) {
      await prisma.project.create({
        data: {
          title: project.title || "Untitled Project",
          description: project.description || "",
          domain: project.domain || null,
          stage: project.stage || null,
          problemStatement: project.problemStatement || null,
          solutionOverview: project.solutionOverview || null,
          requiredSkills: project.requiredSkills || [],
          founderId: user.id,
        }
      });
    }

    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
