"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-xl text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Something went wrong!</h2>
        <p className="text-gray-300 mb-8">We encountered an unexpected error. Please try again or go back home.</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 backdrop-blur-md transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
