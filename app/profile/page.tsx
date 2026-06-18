"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "../api/uploadthing/core";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    bio: "", skills: "", company: "", portfolioUrl: "", goals: "", interests: "", availability: "", pastVentures: "", avatar: ""
  });
  
  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (session) {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setFormData({
              bio: data.user.bio || "",
              skills: data.user.skills?.join(", ") || "",
              company: data.user.company || "",
              portfolioUrl: data.user.portfolioUrl || "",
              goals: data.user.goals || "",
              interests: data.user.interests?.join(", ") || "",
              availability: data.user.availability || "",
              pastVentures: data.user.pastVentures || "",
              avatar: data.user.avatar || "",
            });
          }
          setLoading(false);
        });
    }
  }, [session]);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
        interests: formData.interests.split(",").map((s: string) => s.trim()).filter(Boolean),
      };
      
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) alert("Profile updated successfully!");
      else alert("Failed to update profile");
    } catch (e) {
      alert("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (!session || loading) return <div className="text-center p-8 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800/80 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-8">Your Profile</h1>
        
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/50 shadow-inner overflow-hidden text-white">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-bold">{(session.user?.name || "U").charAt(0)}</span>
              )}
            </div>
            
            <div className="bg-white/5 p-2 rounded-xl border border-white/10 w-full text-center">
              <UploadButton<OurFileRouter, "avatarUploader">
                endpoint="avatarUploader"
                onClientUploadComplete={(res) => {
                  if(res && res.length > 0) {
                    setFormData({ ...formData, avatar: res[0].url });
                    alert("Avatar uploaded successfully!");
                  }
                }}
                onUploadError={(error: Error) => {
                  alert(`ERROR! ${error.message}`);
                }}
              />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Bio</label>
              <textarea name="bio" rows={3} className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none resize-none" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." />
            </div>

            {role === "STUDENT" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Skills (comma separated)</label>
                  <input name="skills" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none" value={formData.skills} onChange={handleChange} placeholder="React, Python, Design..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Interests / Domains (comma separated)</label>
                  <input name="interests" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none" value={formData.interests} onChange={handleChange} placeholder="AI, Web3, FinTech..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Goals</label>
                  <textarea name="goals" rows={2} className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none resize-none" value={formData.goals} onChange={handleChange} placeholder="What are you hoping to achieve?" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Portfolio URL</label>
                  <input name="portfolioUrl" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none" value={formData.portfolioUrl} onChange={handleChange} placeholder="https://yourportfolio.com" />
                </div>
              </>
            )}

            {role === "FOUNDER" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Company Name (if applicable)</label>
                  <input name="company" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none" value={formData.company} onChange={handleChange} placeholder="Your Startup Inc." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Past Ventures / Experience</label>
                  <textarea name="pastVentures" rows={3} className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none resize-none" value={formData.pastVentures} onChange={handleChange} placeholder="Previously founded..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Availability</label>
                  <input name="availability" className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-purple-500 text-white outline-none" value={formData.availability} onChange={handleChange} placeholder="Full-time, Part-time..." />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/10 transition-all disabled:opacity-50">
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
