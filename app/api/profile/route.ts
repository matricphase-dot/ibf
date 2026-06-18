import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        skills: true,
        interests: true,
        goals: true,
        portfolioUrl: true,
        pastVentures: true,
        availability: true,
        company: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
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
    const body = await req.json();

    const {
      name,
      bio,
      skills,
      interests,
      goals,
      portfolioUrl,
      pastVentures,
      availability,
      avatar,
      company,
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (availability !== undefined) updateData.availability = availability;
    if (company !== undefined) updateData.company = company;

    if ((session.user as any).role === "STUDENT") {
      if (skills !== undefined) {
        updateData.skills = Array.isArray(skills)
          ? skills
          : skills.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
      if (interests !== undefined) {
        updateData.interests = Array.isArray(interests)
          ? interests
          : interests.split(",").map((i: string) => i.trim()).filter(Boolean);
      }
      if (goals !== undefined) updateData.goals = goals;
      if (portfolioUrl !== undefined) updateData.portfolioUrl = portfolioUrl;
    } else if ((session.user as any).role === "FOUNDER") {
      if (pastVentures !== undefined) updateData.pastVentures = pastVentures;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
