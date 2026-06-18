import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Briefcase, Calendar, Clock, Award, Target, Lightbulb, CheckSquare } from "lucide-react";
import Link from "next/link";
import ConnectButton from "./ConnectButton";
import { Metadata } from "next";

interface Props {
  params: any;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    return {
      title: "Project Not Found | IBF",
    };
  }

  return {
    title: `${project.title} | IBF – Innovator Bridge Foundry`,
    description: project.description.slice(0, 160),
    openGraph: {
      title: `${project.title} | IBF`,
      description: project.description.slice(0, 160),
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      founder: {
        select: {
          id: true,
          name: true,
          company: true,
          avatar: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Get current connection status for this student
  let connection = null;
  if (userId && userRole === "STUDENT") {
    connection = await prisma.connection.findFirst({
      where: {
        projectId: id,
        studentId: userId,
      },
    });
  }

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": project.title,
    "description": project.description,
    "validThrough": project.deadline?.toISOString(),
    "employmentType": project.engagementType || "OTHER",
    "hiringOrganization": {
      "@type": "Organization",
      "name": project.founder.company || project.founder.name,
      "logo": project.founder.avatar,
    },
    "jobLocationType": "TELECOMMUTE",
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen pb-20 relative">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group text-sm"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Projects
      </Link>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/10 mb-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {project.domain && (
                <span className="px-2.5 py-1 text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/25 rounded-md">
                  {project.domain}
                </span>
              )}
              {project.stage && (
                <span className="px-2.5 py-1 text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 rounded-md">
                  {project.stage}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{project.title}</h1>
            <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
              <span>Posted by: <span className="font-semibold text-gray-200">{project.founder.name}</span> {project.founder.company && `at ${project.founder.company}`}</span>
            </p>
          </div>

          <div className="w-full md:w-auto">
            {userId && userRole === "STUDENT" ? (
              <ConnectButton
                projectId={id}
                initialConnection={connection}
              />
            ) : !userId ? (
              <Link
                href="/auth/signin"
                className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-xl text-center shadow-lg block hover:opacity-95 transition-all"
              >
                Sign in to Connect
              </Link>
            ) : (
              <div className="text-xs text-gray-500 bg-white/5 px-4 py-2.5 border border-white/10 rounded-xl">
                Viewing as Founder
              </div>
            )}
          </div>
        </div>

        {/* Meta Info Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl mb-8">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Engagement</span>
            <span className="text-sm font-semibold text-white mt-0.5">{project.engagementType || "Not Specified"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Commitment</span>
            <span className="text-sm font-semibold text-white mt-0.5">
              {project.commitmentHours ? `${project.commitmentHours}h / week` : "Not Specified"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Duration</span>
            <span className="text-sm font-semibold text-white mt-0.5">
              {project.duration ? `${project.duration} Months` : "Not Specified"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Compensation</span>
            <div className="flex flex-col text-xs font-semibold text-white mt-0.5">
              {project.stipend && <span>Stipend: {project.stipend}</span>}
              {project.equity && <span>Equity: {project.equity}</span>}
              {!project.stipend && !project.equity && <span>XP / Experience</span>}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-8">
          {/* Description */}
          <div>
            <h2 className="text-lg font-bold text-white mb-2.5 flex items-center gap-2">
              <Briefcase size={18} className="text-indigo-400" /> Description
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{project.description}</p>
          </div>

          {/* Problem Statement */}
          {project.problemStatement && (
            <div>
              <h2 className="text-lg font-bold text-white mb-2.5 flex items-center gap-2">
                <Target size={18} className="text-red-400" /> The Problem
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{project.problemStatement}</p>
            </div>
          )}

          {/* Solution Overview */}
          {project.solutionOverview && (
            <div>
              <h2 className="text-lg font-bold text-white mb-2.5 flex items-center gap-2">
                <Lightbulb size={18} className="text-yellow-400" /> The Solution
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{project.solutionOverview}</p>
            </div>
          )}

          {/* Skills Required */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Award size={18} className="text-cyan-400" /> Required Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.requiredSkills.length === 0 ? (
                <span className="text-xs text-gray-500 italic">No specific skills listed</span>
              ) : (
                project.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 text-gray-300 rounded-md font-medium"
                  >
                    {skill}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Milestones */}
          {project.milestones && project.milestones.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <CheckSquare size={18} className="text-emerald-400" /> Milestones
              </h2>
              <ul className="space-y-2.5">
                {project.milestones.map((milestone, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="w-5 h-5 flex items-center justify-center bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded font-bold text-xs mt-0.5">
                      {index + 1}
                    </span>
                    <span className="flex-1">{milestone}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Deadline */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> Application Deadline: {project.deadline ? format(new Date(project.deadline), "MMMM d, yyyy") : "Open recruitment"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
