"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Sparkles, Zap, Tag, Building2, Clock, Send, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";

interface StudentMatch {
  id: string;
  name: string;
  company: string | null;
  founderAvatar: string | null;
  title: string;
  description: string;
  domain: string | null;
  stage: string | null;
  requiredSkills: string[];
  engagementType: string | null;
  equity: string | null;
  stipend: string | null;
  commitmentHours: number | null;
  matchScore: number;
  matchReason: string;
}

interface FounderMatch {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  skills: string[];
  interests: string[];
  availability: string | null;
  bio: string | null;
  portfolioUrl: string | null;
  matchScore: number;
  matchReason: string;
  matchedProjectId: string;
  matchedProjectTitle: string;
}

export default function MatchesPage() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  const role = (session?.user as any)?.role;

  useEffect(() => {
    fetchMatches();
    fetchExistingConnections();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      }
    } catch (err) {
      console.error("Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingConnections = async () => {
    try {
      const res = await fetch("/api/connections");
      if (res.ok) {
        const data = await res.json();
        const ids = new Set<string>();
        data.forEach((c: any) => {
          if (role === "STUDENT") ids.add(c.projectId);
          else ids.add(c.studentId);
        });
        setConnectedIds(ids);
      }
    } catch (err) {
      // Ignore
    }
  };

  const handleConnect = async (targetId: string, projectId?: string) => {
    setConnecting(targetId);
    try {
      const body = role === "STUDENT"
        ? { projectId: targetId }
        : { studentId: targetId, projectId };

      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setConnectedIds((prev) => new Set(prev).add(targetId));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to connect");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setConnecting(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "from-green-500 to-emerald-400";
    if (score >= 40) return "from-yellow-500 to-amber-400";
    return "from-red-500 to-orange-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-green-500/10 border-green-500/20";
    if (score >= 40) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 size={24} className="animate-spin" />
          <span>Finding your best matches...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl shadow-lg border border-purple-500/20"
            style={{ background: "linear-gradient(135deg, rgba(192,38,211,0.2), rgba(6,182,212,0.2))" }}>
            <Sparkles size={28} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {role === "STUDENT" ? "Discover Projects" : "Discover Talent"}
            </h1>
            <p className="text-gray-400 mt-1">
              {role === "STUDENT"
                ? "Projects matched to your skills and interests"
                : "Students who match your project needs"}
            </p>
          </div>
        </div>
      </header>

      {matches.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-12 text-center border border-dashed border-white/20 shadow-xl">
          <Sparkles size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400">No matches found yet</h3>
          <p className="text-gray-500 mt-2">
            {role === "STUDENT"
              ? "Complete your profile with skills and interests to get better matches!"
              : "Create a project with required skills to start matching with students!"}
          </p>
          <Link
            href={role === "STUDENT" ? "/profile" : "/projects/new"}
            className="inline-block mt-4 px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #c026d3, #06b6d4)" }}>
            {role === "STUDENT" ? "Complete Profile" : "Create Project"}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match) => {
            const isStudent = role === "STUDENT";
            const connectKey = isStudent ? match.id : match.id;
            const isConnected = isStudent
              ? connectedIds.has(match.id)
              : connectedIds.has(match.id);

            return (
              <div
                key={match.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group relative overflow-hidden"
              >
                {/* Glow accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    {isStudent ? (
                      <>
                        <Link href={`/projects/${match.id}`}>
                          <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors cursor-pointer">
                            {match.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                          <Building2 size={14} />
                          {match.name} {match.company ? `· ${match.company}` : ""}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                          {match.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Best match for: {match.matchedProjectTitle}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Score Badge */}
                  <div className={`flex flex-col items-center px-3 py-2 rounded-xl border ${getScoreBg(match.matchScore)}`}>
                    <span className={`text-2xl font-black bg-gradient-to-r ${getScoreColor(match.matchScore)} bg-clip-text text-transparent`}>
                      {match.matchScore}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Match</span>
                  </div>
                </div>

                {/* Description / Bio */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {isStudent ? match.description : (match.bio || "No bio provided")}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(isStudent ? match.requiredSkills : match.skills)?.slice(0, 5).map((skill: string) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 text-xs bg-white/5 border border-white/10 text-gray-300 px-2 py-1 rounded-md"
                    >
                      <Tag size={10} />
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Match Reason */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 mb-4">
                  <Zap size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-purple-300">{match.matchReason}</p>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  {isStudent && match.domain && (
                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
                      {match.domain}
                    </span>
                  )}
                  {isStudent && match.stage && (
                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
                      {match.stage}
                    </span>
                  )}
                  {!isStudent && match.availability && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {match.availability}
                    </span>
                  )}
                </div>

                {/* Connect Button */}
                <button
                  onClick={() => handleConnect(
                    isStudent ? match.id : match.id,
                    isStudent ? undefined : match.matchedProjectId
                  )}
                  disabled={isConnected || connecting === connectKey}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                    isConnected
                      ? "bg-white/5 border border-white/10 text-gray-500 cursor-default"
                      : "text-white hover:opacity-90 hover:scale-[1.02] shadow-lg"
                  }`}
                  style={!isConnected ? {
                    background: "linear-gradient(135deg, #c026d3, #06b6d4)",
                    boxShadow: "0 0 20px rgba(192,38,211,0.3)",
                  } : undefined}
                >
                  {isConnected ? (
                    "Request Sent ✓"
                  ) : connecting === connectKey ? (
                    <><Loader2 size={16} className="animate-spin" /> Connecting...</>
                  ) : (
                    <><Send size={16} /> Connect</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
