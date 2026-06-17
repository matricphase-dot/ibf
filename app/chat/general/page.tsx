"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";
import { Send, Globe, User } from "lucide-react";

export default function GeneralChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    fetchMessages();

    // Connect to Socket.io
    socketRef.current = io();
    socketRef.current.emit("join-general");

    socketRef.current.on("new-general-message", (message: any) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [status]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async (cursor?: string) => {
    try {
      const url = cursor ? `/api/chat/general?cursor=${cursor}` : "/api/chat/general";
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch messages");
      }

      if (cursor) {
        setMessages(prev => [...(data.messages || []), ...prev]);
      } else {
        setMessages(data.messages || []);
      }
      setNextCursor(data.nextCursor || null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !session) return;

    try {
      const res = await fetch("/api/chat/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        socketRef.current.emit("send-general-message", newMessage);
        setInput("");
      }
    } catch (error) {
      console.error("Failed to send message");
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-xl overflow-hidden">
      <div className="p-6 bg-white/5 border-b border-white/10 text-white flex items-center gap-3 backdrop-blur-md">
        <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl shadow-lg">
          <Globe size={24} />
        </div>
        <div>
          <h1 className="font-bold text-xl">General Chat</h1>
          <p className="text-xs text-gray-400">Connect with everyone in the hub</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-transparent">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-400">Loading chat history...</div>
        ) : error ? (
          <div className="flex justify-center items-center h-full text-red-400">{error}</div>
        ) : (
          <>
            {nextCursor && (
              <div className="flex justify-center pb-4">
                <button
                  onClick={() => fetchMessages(nextCursor)}
                  className="px-4 py-2 text-xs bg-white/5 text-gray-300 border border-white/10 rounded-full hover:bg-white/10 transition-colors shadow-sm"
                >
                  Load Previous Messages
                </button>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 ${
                  msg.userId === (session?.user as any)?.id ? "flex-row-reverse" : ""
                }`}
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm overflow-hidden flex-shrink-0">
                  {msg.user?.avatar ? <img src={msg.user.avatar} alt="" /> : <User size={16} />}
                </div>
                <div className={`flex flex-col ${msg.userId === (session?.user as any)?.id ? "items-end" : ""}`}>
                  <span className="text-[10px] font-bold text-gray-400 mb-1 ml-1">
                    {msg.user?.name}
                  </span>
                  <div
                    className={`max-w-md px-4 py-2 rounded-2xl text-sm shadow-lg ${
                      msg.userId === (session?.user as any)?.id
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-tr-none"
                        : "bg-white/10 text-gray-100 rounded-tl-none border border-white/5 backdrop-blur-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white/5 backdrop-blur-md border-t border-white/10 flex gap-2">
        <input
          className="flex-1 px-4 py-3 bg-black/20 text-white border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-500"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-colors shadow-lg shadow-indigo-500/25"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
