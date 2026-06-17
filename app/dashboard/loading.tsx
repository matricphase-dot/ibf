export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto p-6 min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium animate-pulse">Loading dashboard...</p>
      </div>
    </div>
  );
}
