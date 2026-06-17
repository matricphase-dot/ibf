"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Briefcase, Clock, Tag, Send } from "lucide-react";
import { format } from "date-fns";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async (cursor?: string) => {
    try {
      const url = cursor ? `/api/projects?cursor=${cursor}` : "/api/projects";
      const res = await fetch(url);
      const data = await res.json();
      
      if (cursor) {
        setProjects(prev => [...prev, ...data.projects]);
      } else {
        setProjects(data.projects);
      }
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (projectId: string) => {
    setApplying(projectId);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, coverLetter: "I am interested in this project!" }),
      });
      if (res.ok) {
        alert("Application sent successfully!");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to apply");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setApplying(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading projects...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
            Explore Projects
          </h1>
          <p className="text-gray-400 mt-2">Find the perfect project to contribute to.</p>
        </div>
        {session?.user && (session.user as any).role === "FOUNDER" && (
          <a
            href="/projects/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            + Create Project
          </a>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors shadow-lg">
                <Briefcase size={24} />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/20 rounded-full uppercase tracking-wider shadow-sm">
                {project.status}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
              {project.title}
            </h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {project.requiredSkills.map((skill: string) => (
                <span
                  key={skill}
                  className="flex items-center gap-1 text-xs bg-white/5 border border-white/10 text-gray-300 px-2 py-1 rounded-md"
                >
                  <Tag size={12} />
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Clock size={14} />
                <span>{project.deadline ? format(new Date(project.deadline), "MMM d, yyyy") : "No deadline"}</span>
              </div>

              {(session?.user as any)?.role === "STUDENT" && (
                <button
                  onClick={() => handleApply(project.id)}
                  disabled={applying === project.id}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg"
                >
                  {applying === project.id ? "Applying..." : (
                    <>
                      Apply <Send size={14} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {nextCursor && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => fetchProjects(nextCursor)}
            className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 backdrop-blur-md transition-all shadow-lg hover:scale-105"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
