"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Zap, Menu, X, LogIn, UserPlus, LogOut, LayoutDashboard, FolderOpen, MessageCircle, User } from "lucide-react";

export default function NavBar() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { href: "/projects", label: "Projects", icon: <FolderOpen size={15} /> },
    ...(status !== "authenticated" || (session?.user as any)?.role === "FOUNDER"
      ? [{ href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} /> }]
      : []),
    { href: "/chat/general", label: "General Chat", icon: <MessageCircle size={15} /> },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 shadow-2xl"
      style={{ background: "rgba(5,5,8,0.85)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
            style={{ background: "linear-gradient(135deg, #c026d3, #06b6d4)" }}>
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight"
            style={{ background: "linear-gradient(90deg, #e879f9, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            IBF
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200">
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {status === "loading" ? (
            <div className="w-24 h-9 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.1)" }} />
          ) : session?.user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "linear-gradient(135deg, #c026d3, #06b6d4)" }}>
                  {session.user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className="text-sm text-gray-200 max-w-24 truncate">{session.user.name ?? session.user.email}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-48 rounded-2xl border border-white/10 shadow-2xl p-1 z-50"
                  style={{ background: "rgba(10,10,18,0.97)", backdropFilter: "blur(20px)" }}>
                  <Link href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                    <User size={15} /> My Profile
                  </Link>
                  {session.user && (session.user as any).role === "FOUNDER" && (
                    <Link href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                  )}
                  <div className="border-t border-white/10 my-1" />
                  <button
                    onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/signin"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 border border-white/15 hover:border-white/30 hover:text-white transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <LogIn size={15} /> Sign In
              </Link>
              <Link href="/auth/signup"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:opacity-90 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #c026d3, #06b6d4)", boxShadow: "0 0 20px rgba(192,38,211,0.4)" }}>
                <UserPlus size={15} /> Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-4 space-y-2"
          style={{ background: "rgba(5,5,8,0.97)" }}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all">
              {link.icon} {link.label}
            </Link>
          ))}
          <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
            {session?.user ? (
              <button
                onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut size={15} /> Sign Out
              </button>
            ) : (
              <>
                <Link href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-300 border border-white/15 hover:bg-white/10 transition-all">
                  <LogIn size={15} /> Sign In
                </Link>
                <Link href="/auth/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #c026d3, #06b6d4)" }}>
                  <UserPlus size={15} /> Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
