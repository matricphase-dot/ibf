import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Compute match score between a student and a project
function computeStudentProjectMatch(
  student: { skills: string[]; interests: string[]; availability: string | null },
  project: { requiredSkills: string[]; domain: string | null; engagementType: string | null }
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // 1. Skill overlap (40%)
  const studentSkillsLower = student.skills.map((s) => s.toLowerCase().trim());
  const projectSkillsLower = project.requiredSkills.map((s) => s.toLowerCase().trim());
  const skillIntersection = studentSkillsLower.filter((s) =>
    projectSkillsLower.some((ps) => ps.includes(s) || s.includes(ps))
  );
  if (projectSkillsLower.length > 0) {
    const skillScore = (skillIntersection.length / projectSkillsLower.length) * 40;
    score += Math.min(skillScore, 40);
    if (skillIntersection.length > 0) {
      reasons.push(`${skillIntersection.join(", ")} skills align`);
    }
  } else {
    score += 20; // No skills required = partial match
  }

  // 2. Domain alignment (30%)
  if (project.domain && student.interests.length > 0) {
    const domainLower = project.domain.toLowerCase().trim();
    const interestMatch = student.interests.some(
      (i) => i.toLowerCase().trim().includes(domainLower) || domainLower.includes(i.toLowerCase().trim())
    );
    if (interestMatch) {
      score += 30;
      reasons.push(`${project.domain} interest matches`);
    }
  } else if (!project.domain) {
    score += 15;
  }

  // 3. Availability (20%)
  if (student.availability) {
    score += 20;
    reasons.push("Availability confirmed");
  } else {
    score += 10;
  }

  // 4. Engagement type (10%)
  if (project.engagementType) {
    score += 10;
  } else {
    score += 5;
  }

  return { score: Math.round(Math.min(score, 100)), reasons };
}

// Compute match score between a founder's project and a student
function computeFounderStudentMatch(
  founderProject: { requiredSkills: string[]; domain: string | null; engagementType: string | null },
  student: { skills: string[]; interests: string[]; availability: string | null }
): { score: number; reasons: string[] } {
  // Reuse the same logic but from the project's perspective
  return computeStudentProjectMatch(student, founderProject);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    if (role === "STUDENT") {
      // Get the student's profile
      const student = await prisma.user.findUnique({
        where: { id: userId },
        select: { skills: true, interests: true, availability: true },
      });

      if (!student) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Get all OPEN projects
      const projects = await prisma.project.findMany({
        where: { status: "OPEN" },
        include: {
          founder: { select: { name: true, company: true, avatar: true } },
        },
        take: 20,
      });

      // Compute matches
      const matches = projects
        .map((project) => {
          const { score, reasons } = computeStudentProjectMatch(student, project);
          return {
            id: project.id,
            name: project.founder.name,
            company: project.founder.company,
            founderAvatar: project.founder.avatar,
            title: project.title,
            description: project.description,
            domain: project.domain,
            stage: project.stage,
            requiredSkills: project.requiredSkills,
            engagementType: project.engagementType,
            equity: project.equity,
            stipend: project.stipend,
            commitmentHours: project.commitmentHours,
            matchScore: score,
            matchReason: reasons.join("; ") || "General match",
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore);

      return NextResponse.json(matches);
    } else if (role === "FOUNDER") {
      // Get founder's projects
      const founderProjects = await prisma.project.findMany({
        where: { founderId: userId, status: "OPEN" },
        select: { id: true, title: true, requiredSkills: true, domain: true, engagementType: true },
      });

      if (founderProjects.length === 0) {
        return NextResponse.json([]);
      }

      // Get all students
      const students = await prisma.user.findMany({
        where: { role: "STUDENT" },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          skills: true,
          interests: true,
          availability: true,
          bio: true,
          portfolioUrl: true,
          goals: true,
        },
        take: 50,
      });

      // For each student, find the best matching project and compute score
      const matches = students
        .map((student) => {
          let bestScore = 0;
          let bestReasons: string[] = [];
          let bestProjectId = founderProjects[0].id;
          let bestProjectTitle = founderProjects[0].title;

          for (const project of founderProjects) {
            const { score, reasons } = computeFounderStudentMatch(project, student);
            if (score > bestScore) {
              bestScore = score;
              bestReasons = reasons;
              bestProjectId = project.id;
              bestProjectTitle = project.title;
            }
          }

          return {
            id: student.id,
            name: student.name,
            email: student.email,
            avatar: student.avatar,
            skills: student.skills,
            interests: student.interests,
            availability: student.availability,
            bio: student.bio,
            portfolioUrl: student.portfolioUrl,
            matchScore: bestScore,
            matchReason: bestReasons.join("; ") || "General match",
            matchedProjectId: bestProjectId,
            matchedProjectTitle: bestProjectTitle,
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore);

      return NextResponse.json(matches);
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (error) {
    console.error("Matches error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
