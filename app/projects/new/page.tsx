"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Rocket, Plus, X, Calendar, Wrench } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    domain: "",
    stage: "",
    problemStatement: "",
    solutionOverview: "",
    equity: "",
    stipend: "",
    engagementType: "",
    commitmentHours: "",
    duration: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  
  const [milestoneInput, setMilestoneInput] = useState("");
  const [milestones, setMilestones] = useState<string[]>([]);

  if (!session || (session.user as any).role !== "FOUNDER") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 mb-4">
          <X size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Unauthorized</h2>
        <p className="text-gray-400">Only founders can create projects.</p>
      </div>
    );
  }

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };
  
  const handleAddMilestone = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && milestoneInput.trim()) {
      e.preventDefault();
      if (!milestones.includes(milestoneInput.trim())) {
        setMilestones([...milestones, milestoneInput.trim()]);
      }
      setMilestoneInput("");
    }
  };

  const removeMilestone = (milestone: string) => {
    setMilestones(milestones.filter((m) => m !== milestone));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          commitmentHours: formData.commitmentHours ? parseInt(formData.commitmentHours, 10) : null,
          duration: formData.duration ? parseInt(formData.duration, 10) : null,
          requiredSkills: skills,
          milestones: milestones,
        }),
      });

      if (res.ok) {
        router.push("/projects");
        router.refresh();
      } else {
        alert("Failed to create project");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-screen pb-20">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to Projects</span>
      </button>

      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />

        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
            <Rocket size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Create New Project</h1>
            <p className="text-gray-400 text-sm mt-1">Launch a new initiative and find the best talent.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Project Title</label>
              <input required name="title" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none" value={formData.title} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Domain</label>
              <input name="domain" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none" value={formData.domain} onChange={handleChange} placeholder="e.g. DeFi, AI, EdTech" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Stage</label>
              <input name="stage" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none" value={formData.stage} onChange={handleChange} placeholder="e.g. Idea, Prototype, Seed" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Engagement Type</label>
              <input name="engagementType" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none" value={formData.engagementType} onChange={handleChange} placeholder="e.g. Full-time, Part-time, Contract" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Commitment (Hours/Week)</label>
              <input inputMode="numeric" pattern="[0-9]*" name="commitmentHours" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none" value={formData.commitmentHours} onChange={handleChange} placeholder="e.g. 20" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Duration (Months)</label>
              <input inputMode="numeric" pattern="[0-9]*" name="duration" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none" value={formData.duration} onChange={handleChange} placeholder="e.g. 3" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Equity (Optional)</label>
              <input name="equity" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none" value={formData.equity} onChange={handleChange} placeholder="e.g. 1-2%" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Stipend (Optional)</label>
              <input name="stipend" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none" value={formData.stipend} onChange={handleChange} placeholder="e.g. $1000/mo" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Description</label>
            <textarea required name="description" rows={3} className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none resize-none" placeholder="Describe your project, goals, and what you're looking for..." value={formData.description} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Problem Statement</label>
            <textarea name="problemStatement" rows={3} className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none resize-none" placeholder="What problem are you solving?" value={formData.problemStatement} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Solution Overview</label>
            <textarea name="solutionOverview" rows={3} className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none resize-none" placeholder="How are you solving it?" value={formData.solutionOverview} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Required Skills</label>
            <div className="relative">
              <input className="w-full pl-4 pr-12 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none" placeholder="Type a skill and press Enter" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} />
              <div className="absolute right-4 top-3 text-gray-500"><Wrench size={20} /></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map((skill) => (
                <span key={skill} className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full text-sm font-medium border border-purple-500/20">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white"><X size={14} /></button>
                </span>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Milestones</label>
            <div className="relative">
              <input className="w-full pl-4 pr-12 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none" placeholder="Type a milestone and press Enter" value={milestoneInput} onChange={(e) => setMilestoneInput(e.target.value)} onKeyDown={handleAddMilestone} />
            </div>
            <div className="flex flex-col gap-2 mt-3">
              {milestones.map((milestone, idx) => (
                <span key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-300 rounded-md text-sm font-medium border border-blue-500/20 w-fit">
                  {idx + 1}. {milestone}
                  <button type="button" onClick={() => removeMilestone(milestone)} className="hover:text-white ml-2"><X size={14} /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Deadline (Optional)</label>
            <div className="relative">
              <input type="date" name="deadline" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none [color-scheme:dark]" value={formData.deadline} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/10 disabled:opacity-50 transition-all active:scale-[0.99]">
            {loading ? "Creating Project..." : "Launch Project"}
          </button>
        </form>
      </div>
    </div>
  );
}
