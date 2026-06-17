"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, X, MessageSquare, User, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, status: string) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  const projectList = Array.isArray(projects) ? projects : [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl shadow-lg border border-indigo-500/20">
            <LayoutDashboard size={28} />
          </div>
          <h1 className="text-4xl font-bold text-white">Founder Dashboard</h1>
        </div>
        <p className="text-gray-400 ml-1">Manage your projects and review applications.</p>
      </header>

      <div className="space-y-10">
        {projectList.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-12 text-center border border-dashed border-white/20 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-400">No projects created yet.</h3>
            <Link href="/projects/new" className="text-indigo-400 font-medium hover:text-indigo-300 mt-2 inline-block transition-colors">
              Create your first project →
            </Link>
          </div>
        ) : (
          projectList.map((project) => (
            <div key={project.id} className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
              <div className="p-8 border-b border-white/10 bg-white/5">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">{project.title}</h2>
                  <Link
                    href={`/chat/direct/${project.id}`}
                    className="flex items-center gap-2 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors bg-indigo-500/10 px-4 py-2 rounded-xl"
                  >
                    <MessageSquare size={20} /> Project Chat
                  </Link>
                </div>
                <p className="text-gray-400 mt-2">{project.applications.length} total applications</p>
              </div>

              <div className="p-8 bg-transparent">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Applications</h3>
                <div className="space-y-4">
                  {project.applications.length === 0 ? (
                    <p className="text-gray-500 italic">No applications yet.</p>
                  ) : (
                    project.applications.map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 shadow-inner">
                            <User size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-200">{app.student.name}</h4>
                            <p className="text-sm text-gray-500">{app.student.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {app.status === "PENDING" ? (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(app.id, "REJECTED")}
                                className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors shadow-sm"
                                title="Reject"
                              >
                                <X size={24} />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(app.id, "ACCEPTED")}
                                className="p-2 text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-xl transition-colors shadow-sm"
                                title="Accept"
                              >
                                <Check size={24} />
                              </button>
                            </>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                              app.status === "ACCEPTED" ? "bg-green-500/20 text-green-400 border-green-500/20" : "bg-red-500/20 text-red-400 border-red-500/20"
                            }`}>
                              {app.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
