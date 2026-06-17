"use client";

import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, Zap, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const justRegistered = searchParams.get("registered") === "true";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
      callbackUrl,
    });

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      const session = await getSession();
      if (session?.user && (session.user as any).role === "STUDENT" && callbackUrl === "/dashboard") {
        router.push("/projects");
      } else {
        router.push(callbackUrl);
      }
      router.refresh();
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
              <LogIn size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Sign in to your IBF account</p>
          </div>

          {/* Success message after registration */}
          {justRegistered && (
            <div className="mb-5 p-3 rounded-xl border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2"
              style={{ background: "rgba(16,185,129,0.1)" }}>
              <CheckCircle size={16} /> Account created! Please sign in.
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-xl border border-red-500/30 text-red-400 text-sm flex items-center gap-2"
              style={{ background: "rgba(239,68,68,0.1)" }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
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
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  required
                  type={showPass ? "text" : "password"}
                  placeholder="Your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-white/10 text-white placeholder-gray-600 outline-none focus:border-fuchsia-500 transition-all text-sm"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 mt-2"
              style={{
                background: "linear-gradient(135deg, #c026d3, #06b6d4)",
                boxShadow: "0 0 25px rgba(192,38,211,0.4)",
              }}>
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Zap size={16} /> Sign In
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold hover:text-white transition-colors"
              style={{ color: "#e879f9" }}>
              Sign up free
            </Link>
          </p>
        </div>

        {/* Decorative glow blobs */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-10"
            style={{ background: "#c026d3" }} />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-10"
            style={{ background: "#06b6d4" }} />
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-fuchsia-500/30 border-t-fuchsia-500 animate-spin" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
