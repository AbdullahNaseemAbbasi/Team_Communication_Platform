"use client";

export default function WorkspacePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
        <span className="text-4xl">👋</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Welcome to TeamChat</h2>
      <p className="text-[#949ba4] max-w-md">
        Select a channel from the sidebar to start chatting with your team. Or create a new channel to get started!
      </p>
    </div>
  );
}
