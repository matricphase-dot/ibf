"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Zap, User, Briefcase, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("STUDENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    // Student
    skills: "", interests: "", goals: "", portfolioUrl: "",
    // Founder User
    pastVentures: "", availability: "",
    // Founder Project
    projectTitle: "", projectDomain: "", projectStage: "", projectDescription: "", projectProblem: "", projectSolution: "", projectTeamNeeds: "",
  });

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNext = () => {
    // Basic validation
    if (step === 1 && (!formData.name || !formData.email || !formData.password)) {
      setError("Please fill all required fields");
      return;
    }
    setError("");
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(s => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Prepare payload
    const payload: any = {
      name: formData.name, email: formData.email, password: formData.password, role,
    };

    if (role === "STUDENT") {
      payload.skills = formData.skills.split(",").map(s => s.trim()).filter(Boolean);
      payload.interests = formData.interests.split(",").map(s => s.trim()).filter(Boolean);
      payload.goals = formData.goals;
      payload.portfolioUrl = formData.portfolioUrl;
    } else {
      payload.pastVentures = formData.pastVentures;
      payload.availability = formData.availability;
      payload.project = {
        title: formData.projectTitle,
        domain: formData.projectDomain,
        stage: formData.projectStage,
        description: formData.projectDescription,
        problemStatement: formData.projectProblem,
        solutionOverview: formData.projectSolution,
        requiredSkills: formData.projectTeamNeeds.split(",").map(s => s.trim()).filter(Boolean),
      };
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.push("/auth/signin?registered=true");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-xl">
        <div className="rounded-3xl border border-white/10 p-8 shadow-2xl" style={{ background: "rgba(10,10,20,0.85)", backdropFilter: "blur(24px)" }}>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-1">Create Account</h1>
            <p className="text-gray-400 text-sm">Step {step} of {role === "FOUNDER" ? 4 : 3}</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl border border-red-500/30 text-red-400 text-sm flex items-center gap-2" style={{ background: "rgba(239,68,68,0.1)" }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input required name="name" placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 transition-all text-sm bg-white/5" value={formData.name} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address *</label>
                  <input required type="email" name="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 transition-all text-sm bg-white/5" value={formData.email} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password *</label>
                  <div className="relative">
                    <input required type={showPass ? "text" : "password"} name="password" placeholder="Min 8 characters" className="w-full pl-4 pr-10 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 transition-all text-sm bg-white/5" value={formData.password} onChange={handleChange} />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">I am a...</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "STUDENT", label: "Student", desc: "Find projects", icon: <User size={20} /> },
                      { value: "FOUNDER", label: "Founder", desc: "Post projects", icon: <Briefcase size={20} /> },
                    ].map((r) => (
                      <button key={r.value} type="button" onClick={() => setRole(r.value)} className="p-4 rounded-xl border text-left transition-all" style={{ background: role === r.value ? "rgba(192,38,211,0.15)" : "rgba(255,255,255,0.03)", borderColor: role === r.value ? "rgba(192,38,211,0.6)" : "rgba(255,255,255,0.1)" }}>
                        <div className={`mb-2 ${role === r.value ? "text-fuchsia-400" : "text-gray-500"}`}>{r.icon}</div>
                        <div className={`font-bold text-sm ${role === r.value ? "text-white" : "text-gray-400"}`}>{r.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 2 && role === "STUDENT" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Skills (comma separated)</label>
                  <input name="skills" placeholder="React, Node.js, Design" className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 bg-white/5" value={formData.skills} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Interests / Domains (comma separated)</label>
                  <input name="interests" placeholder="DeFi, AI, EdTech" className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 bg-white/5" value={formData.interests} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Goals</label>
                  <textarea name="goals" placeholder="What are you looking to achieve?" rows={3} className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 bg-white/5 resize-none" value={formData.goals} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Portfolio URL</label>
                  <input name="portfolioUrl" placeholder="https://..." className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 bg-white/5" value={formData.portfolioUrl} onChange={handleChange} />
                </div>
              </>
            )}

            {step === 2 && role === "FOUNDER" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Past Ventures / Experience</label>
                  <textarea name="pastVentures" placeholder="Tell us about your background..." rows={4} className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 bg-white/5 resize-none" value={formData.pastVentures} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Availability</label>
                  <input name="availability" placeholder="e.g. Full-time, 20 hrs/week" className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 bg-white/5" value={formData.availability} onChange={handleChange} />
                </div>
              </>
            )}

            {step === 3 && role === "FOUNDER" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Startup Name</label>
                    <input name="projectTitle" className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 bg-white/5" value={formData.projectTitle} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Domain</label>
                    <input name="projectDomain" placeholder="e.g. AI" className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 bg-white/5" value={formData.projectDomain} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Stage</label>
                  <input name="projectStage" placeholder="Idea, Prototype, MVP" className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 bg-white/5" value={formData.projectStage} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">One-Liner (Description)</label>
                  <input name="projectDescription" className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 bg-white/5" value={formData.projectDescription} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Problem</label>
                  <textarea name="projectProblem" rows={2} className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 bg-white/5 resize-none" value={formData.projectProblem} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Solution</label>
                  <textarea name="projectSolution" rows={2} className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 bg-white/5 resize-none" value={formData.projectSolution} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Team Needs (comma separated)</label>
                  <input name="projectTeamNeeds" placeholder="React Developer, UI Designer" className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 bg-white/5" value={formData.projectTeamNeeds} onChange={handleChange} />
                </div>
              </>
            )}

            {(step === 3 && role === "STUDENT") || (step === 4 && role === "FOUNDER") ? (
              <div className="text-center py-6">
                <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Match Preview</h3>
                <p className="text-gray-400 mb-6 text-sm">
                  You're all set! Your profile has been generated. Ready to jump in and {role === "STUDENT" ? "find your next big project" : "meet amazing talent"}?
                </p>
                
                <div className="flex gap-3 justify-center">
                  <button type="button" onClick={handleBack} className="px-6 py-3 rounded-xl font-bold text-gray-300 bg-white/5 hover:bg-white/10 transition-all text-sm">Back</button>
                  <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #c026d3, #06b6d4)", boxShadow: "0 0 25px rgba(192,38,211,0.4)" }}>
                    {loading ? "Creating..." : "Complete Setup"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <button type="button" onClick={handleBack} className="px-4 py-3 rounded-xl font-bold text-gray-300 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center">
                    <ArrowLeft size={16} />
                  </button>
                )}
                <button type="button" onClick={handleNext} className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #c026d3, #06b6d4)" }}>
                  Next <ArrowRight size={16} />
                </button>
              </div>
            )}
          </form>

          {step === 1 && (
            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account? <Link href="/auth/signin" className="font-semibold hover:text-white transition-colors" style={{ color: "#e879f9" }}>Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
