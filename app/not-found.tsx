"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 shadow-2xl text-center">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">The page you are looking for does not exist or has been moved.</p>
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-500/25 transition-all hover:scale-105"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
