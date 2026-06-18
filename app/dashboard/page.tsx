"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, X, MessageSquare, User, LayoutDashboard, Link2, Clock, Send, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const [dashRes, connRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/connections"),
      ]);
      const dashData = await dashRes.json();
      const connData = await connRes.json();
      setProjects(Array.isArray(dashData) ? dashData : []);
      setConnections(Array.isArray(connData) ? connData : []);
    } catch (error) {
      console.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionUpdate = async (connectionId: string, status: string) => {
    setUpdatingId(connectionId);
    try {
      const res = await fetch("/api/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, status }),
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to update connection");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setUpdatingId(null);
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

  if (loading) return <div className="p-8 text-center text-gray-400">Loading dashboard...</div>;

  const pendingConnections = connections.filter((c: any) => c.status === "PENDING");
  const acceptedConnections = connections.filter((c: any) => c.status === "ACCEPTED");

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl shadow-lg border border-indigo-500/20">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">
              {role === "FOUNDER" ? "Founder Dashboard" : "My Connections"}
            </h1>
            <p className="text-gray-400 mt-1">
              {role === "FOUNDER"
                ? "Manage your projects and connection requests."
                : "Track your connection requests and chat access."}
            </p>
          </div>
        </div>
      </header>

      {/* Connection Requests Section */}
      {role === "FOUNDER" && pendingConnections.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Link2 size={20} className="text-purple-400" />
            Pending Connection Requests
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold text-purple-400 bg-purple-500/20 border border-purple-500/20">
              {pendingConnections.length}
            </span>
          </h2>
          <div className="space-y-4">
            {pendingConnections.map((conn: any) => (
              <div
                key={conn.id}
                className="flex items-center justify-between p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 shadow-inner">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-200">{conn.student.name}</h4>
                    <p className="text-sm text-gray-500">{conn.student.email}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {conn.student.skills?.slice(0, 3).map((s: string) => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-gray-400">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-gray-500">
                    For: <span className="text-gray-300">{conn.project.title}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleConnectionUpdate(conn.id, "REJECTED")}
                      disabled={updatingId === conn.id}
                      className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                      title="Decline"
                    >
                      <X size={20} />
                    </button>
                    <button
                      onClick={() => handleConnectionUpdate(conn.id, "ACCEPTED")}
                      disabled={updatingId === conn.id}
                      className="p-2 text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                      title="Accept"
                    >
                      <Check size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted Connections / Active Chats */}
      {acceptedConnections.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare size={20} className="text-green-400" />
            Active Connections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acceptedConnections.map((conn: any) => (
              <div
                key={conn.id}
                className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-green-500/20 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-200">
                        {role === "FOUNDER" ? conn.student?.name : conn.founder?.name}
                      </h4>
                      <p className="text-xs text-gray-500">{conn.project.title}</p>
                    </div>
                  </div>
                  <Link
                    href={`/chat/direct/${conn.project.id}`}
                    className="flex items-center gap-2 text-green-400 font-semibold hover:text-green-300 transition-colors bg-green-500/10 px-4 py-2 rounded-xl text-sm"
                  >
                    <MessageSquare size={16} /> Chat
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student: Show sent requests */}
      {role === "STUDENT" && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Send size={20} className="text-blue-400" />
            My Requests
          </h2>
          {connections.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-12 text-center border border-dashed border-white/20 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-400">No connection requests yet</h3>
              <Link href="/matches" className="text-purple-400 font-medium hover:text-purple-300 mt-2 inline-block transition-colors">
                Discover matches →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map((conn: any) => (
                <div key={conn.id} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-200">{conn.project.title}</h4>
                      <p className="text-xs text-gray-500">{conn.founder?.name || "Founder"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      conn.status === "PENDING"
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/20"
                        : conn.status === "ACCEPTED"
                        ? "bg-green-500/20 text-green-400 border-green-500/20"
                        : "bg-red-500/20 text-red-400 border-red-500/20"
                    }`}>
                      {conn.status}
                    </span>
                    {conn.status === "ACCEPTED" && (
                      <Link
                        href={`/chat/direct/${conn.project.id}`}
                        className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors text-sm"
                      >
                        <MessageSquare size={14} /> Chat
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Founder: Existing Projects & Applications (legacy) */}
      {role === "FOUNDER" && (
        <div className="space-y-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard size={20} className="text-indigo-400" />
            Your Projects
          </h2>
          {projects.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-12 text-center border border-dashed border-white/20 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-400">No projects created yet.</h3>
              <Link href="/projects/new" className="text-indigo-400 font-medium hover:text-indigo-300 mt-2 inline-block transition-colors">
                Create your first project →
              </Link>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
                <div className="p-8 border-b border-white/10 bg-white/5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{project.title}</h2>
                      {project.domain && (
                        <span className="text-xs text-gray-500 mt-1 inline-block">{project.domain} · {project.stage || "—"}</span>
                      )}
                    </div>
                    <Link
                      href={`/chat/direct/${project.id}`}
                      className="flex items-center gap-2 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors bg-indigo-500/10 px-4 py-2 rounded-xl"
                    >
                      <MessageSquare size={20} /> Project Chat
                    </Link>
                  </div>
                  <p className="text-gray-400 mt-2">{project.applications?.length || 0} total applications</p>
                </div>

                <div className="p-8 bg-transparent">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Applications</h3>
                  <div className="space-y-4">
                    {(!project.applications || project.applications.length === 0) ? (
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
      )}
    </div>
  );
}
