"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Zap, User, Briefcase, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "", name: "", role: "STUDENT" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      router.push("/auth/signin?registered=true");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-white/10 p-8 shadow-2xl"
          style={{ background: "rgba(10,10,20,0.85)", backdropFilter: "blur(24px)" }}>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg"
              style={{ background: "linear-gradient(135deg, #c026d3, #06b6d4)", boxShadow: "0 0 30px rgba(192,38,211,0.5)" }}>
              <UserPlus size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Create Account</h1>
            <p className="text-gray-400 text-sm">Join the IBF platform for free</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl border border-red-500/30 text-red-400 text-sm flex items-center gap-2"
              style={{ background: "rgba(239,68,68,0.1)" }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  required
                  placeholder="Your name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 transition-all text-sm"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  required
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 transition-all text-sm"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  required
                  type={showPass ? "text" : "password"}
                  placeholder="Min 8 characters"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 transition-all text-sm"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "STUDENT", label: "Student", desc: "Find projects & gain XP", icon: <User size={20} /> },
                  { value: "FOUNDER", label: "Founder", desc: "Post projects & find talent", icon: <Briefcase size={20} /> },
                ].map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.value })}
                    className="p-4 rounded-xl border text-left transition-all duration-200"
                    style={{
                      background: formData.role === role.value ? "rgba(192,38,211,0.15)" : "rgba(255,255,255,0.03)",
                      borderColor: formData.role === role.value ? "rgba(192,38,211,0.6)" : "rgba(255,255,255,0.1)",
                      boxShadow: formData.role === role.value ? "0 0 15px rgba(192,38,211,0.2)" : "none",
                    }}>
                    <div className={`mb-2 ${formData.role === role.value ? "text-fuchsia-400" : "text-gray-500"}`}>
                      {role.icon}
                    </div>
                    <div className={`font-bold text-sm ${formData.role === role.value ? "text-white" : "text-gray-400"}`}>
                      {role.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{role.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 mt-2"
              style={{ background: "linear-gradient(135deg, #c026d3, #06b6d4)", boxShadow: "0 0 25px rgba(192,38,211,0.4)" }}>
              {loading ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating account...</>
              ) : (
                <><Zap size={16} /> Create My Account</>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-semibold hover:text-white transition-colors"
              style={{ color: "#e879f9" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
