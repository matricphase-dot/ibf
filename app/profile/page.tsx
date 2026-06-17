"use client";

import { useSession } from "next-auth/react";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "../api/uploadthing/core";

export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session) return <div className="text-center p-8 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl text-center">
        <h1 className="text-3xl font-bold text-white mb-6">Your Profile</h1>
        <div className="flex flex-col items-center gap-6">
          <div className="w-32 h-32 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/50 shadow-inner overflow-hidden text-white">
            {(session.user as any)?.avatar ? (
              <img src={(session.user as any).avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl font-bold">{(session.user?.name || "U").charAt(0)}</span>
            )}
          </div>
          
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <UploadButton<OurFileRouter, "avatarUploader">
              endpoint="avatarUploader"
              onClientUploadComplete={(res) => {
                alert("Avatar uploaded successfully!");
                // Future enhancement: save to DB
              }}
              onUploadError={(error: Error) => {
                alert(`ERROR! ${error.message}`);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
