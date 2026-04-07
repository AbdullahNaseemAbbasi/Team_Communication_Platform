"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import Sidebar from "@/components/sidebar/Sidebar";
import NotificationBell from "@/components/notifications/NotificationBell";
import { connectSocket, disconnectSocket } from "@/lib/socket";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, fetchUser, user } = useAuthStore();
  const { activeChannel } = useWorkspaceStore();
  const router = useRouter();

  useEffect(() => { fetchUser(); }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
      return () => { disconnectSocket(); };
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#313338]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading TeamChat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen flex overflow-hidden bg-[#313338]">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 border-b border-[#1f2023] flex items-center justify-between px-4 bg-[#313338] shrink-0">
          <div className="flex items-center gap-2">
            {activeChannel ? (
              <>
                <span className="text-[#949ba4] text-lg">{activeChannel.type === "private" ? "🔒" : "#"}</span>
                <h2 className="font-bold text-white text-[15px]">{activeChannel.name}</h2>
                {activeChannel.topic && (
                  <>
                    <span className="text-[#3f4147] mx-2">|</span>
                    <p className="text-[13px] text-[#949ba4] truncate">{activeChannel.topic}</p>
                  </>
                )}
              </>
            ) : (
              <h2 className="text-[#949ba4]">Select a channel to start chatting</h2>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[#949ba4]">
              <span className="text-xs bg-[#2b2d31] px-2 py-1 rounded">{user?.displayName}</span>
            </div>
            <NotificationBell />
          </div>
        </header>
        <div className="flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  );
}
