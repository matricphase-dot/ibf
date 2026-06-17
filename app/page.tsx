import Link from "next/link";
import { ArrowRight, Zap, Shield, Users, Rocket, Star, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">

      {/* Hero Section */}
      <section className="w-full max-w-7xl px-4 sm:px-6 py-24 md:py-36 flex flex-col items-center text-center relative">
        {/* Background glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl -z-10 opacity-20"
          style={{ background: "radial-gradient(ellipse, #c026d3 0%, transparent 70%)" }} />
        <div className="absolute top-32 left-1/4 w-64 h-64 rounded-full blur-3xl -z-10 opacity-10"
          style={{ background: "#06b6d4" }} />
        <div className="absolute top-32 right-1/4 w-64 h-64 rounded-full blur-3xl -z-10 opacity-10"
          style={{ background: "#ec4899" }} />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border"
          style={{
            background: "rgba(192,38,211,0.1)",
            borderColor: "rgba(192,38,211,0.3)",
            color: "#e879f9",
          }}>
          <Zap size={12} className="animate-pulse" />
          The Future of Startup Collaboration
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-none">
          Where Founders &amp;{" "}
          <br className="hidden md:block" />
          <span
            className="inline-block"
            style={{
              background: "linear-gradient(90deg, #e879f9, #22d3ee, #e879f9)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "none",
              animation: "shimmer 3s linear infinite",
            }}>
            Talent Meet.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          The ultimate platform for founders to launch projects and for students to gain
          real-world experience. Built for speed, security, and real-time collaboration.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/auth/signup"
            className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #c026d3, #06b6d4)",
              boxShadow: "0 0 30px rgba(192,38,211,0.5), 0 4px 20px rgba(0,0,0,0.3)",
            }}>
            Get Started Free
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/projects"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-lg border border-white/15 hover:border-white/30 hover:bg-white/5 backdrop-blur-md transition-all duration-300 hover:scale-105"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            Explore Projects
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8 mt-14 flex-wrap justify-center">
          {[
            { icon: <Users size={16} />, label: "500+ Students" },
            { icon: <Rocket size={16} />, label: "120+ Projects" },
            { icon: <Star size={16} />, label: "4.9 Rating" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2 text-sm text-gray-500">
              <span style={{ color: "#e879f9" }}>{stat.icon}</span>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Everything you need to{" "}
              <span style={{ color: "#e879f9" }}>collaborate</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Powerful tools designed specifically for the modern startup ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield size={28} />,
                title: "Secure Collaboration",
                desc: "Private encrypted channels for every project to ensure your ideas stay safe.",
                color: "#06b6d4",
                glow: "rgba(6,182,212,0.15)",
              },
              {
                icon: <Users size={28} />,
                title: "Smart Talent Matching",
                desc: "AI-powered filtering to match the best students with the most exciting startup projects.",
                color: "#c026d3",
                glow: "rgba(192,38,211,0.15)",
              },
              {
                icon: <TrendingUp size={28} />,
                title: "Real-time Updates",
                desc: "Stay in sync with instant notifications and live chat powered by Socket.io.",
                color: "#ec4899",
                glow: "rgba(236,72,153,0.15)",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-8 rounded-2xl border border-white/8 hover:-translate-y-2 transition-all duration-300 cursor-default"
                style={{
                  background: `radial-gradient(ellipse at top left, ${feature.glow} 0%, rgba(10,10,20,0.6) 60%)`,
                  borderColor: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                }}>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300"
                  style={{ background: `${feature.glow}`, border: `1px solid ${feature.color}30`, color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="w-full py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="p-12 rounded-3xl border border-white/10 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(192,38,211,0.15) 0%, rgba(6,182,212,0.1) 100%)",
              backdropFilter: "blur(20px)",
            }}>
            <div className="absolute inset-0 rounded-3xl -z-10"
              style={{ background: "radial-gradient(ellipse at center, rgba(192,38,211,0.1) 0%, transparent 70%)" }} />
            <Rocket size={40} className="mx-auto mb-4" style={{ color: "#e879f9" }} />
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Ready to launch your idea?
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Join hundreds of founders and students already collaborating on IBF.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #c026d3, #06b6d4)",
                boxShadow: "0 0 30px rgba(192,38,211,0.4)",
              }}>
              Start for Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
