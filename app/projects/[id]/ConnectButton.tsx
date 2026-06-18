"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, MessageSquare, Loader2 } from "lucide-react";

interface ConnectButtonProps {
  projectId: string;
  initialConnection: any;
}

export default function ConnectButton({ projectId, initialConnection }: ConnectButtonProps) {
  const router = useRouter();
  const [connection, setConnection] = useState<any>(initialConnection);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (res.ok) {
        const data = await res.json();
        setConnection(data);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to send connection request");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (connection) {
    if (connection.status === "ACCEPTED") {
      return (
        <button
          onClick={() => router.push(`/chat/direct/${projectId}`)}
          className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.99]"
        >
          <MessageSquare size={18} /> Chat with Founder
        </button>
      );
    }

    if (connection.status === "PENDING") {
      return (
        <button
          disabled
          className="w-full md:w-auto px-6 py-3.5 bg-white/5 border border-white/10 text-gray-500 font-bold rounded-xl cursor-default text-center"
        >
          Connection Pending ✓
        </button>
      );
    }

    if (connection.status === "REJECTED") {
      return (
        <button
          disabled
          className="w-full md:w-auto px-6 py-3.5 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-xl cursor-default text-center"
        >
          Request Declined
        </button>
      );
    }
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-[0.99]"
    >
      {loading ? (
        <><Loader2 size={18} className="animate-spin" /> Connecting...</>
      ) : (
        <><Send size={18} /> Connect</>
      )}
    </button>
  );
}
