"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import Sidebar from "@/components/sidebar/Sidebar";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();
  const { activeChannel } = useWorkspaceStore();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b flex items-center justify-between px-6 bg-white dark:bg-slate-950 shrink-0">
          <div>
            {activeChannel ? (
              <div>
                <h2 className="font-semibold text-lg">
                  {activeChannel.type === "private" ? "🔒" : "#"}{" "}
                  {activeChannel.name}
                </h2>
                {activeChannel.topic && (
                  <p className="text-xs text-muted-foreground">
                    {activeChannel.topic}
                  </p>
                )}
              </div>
            ) : (
              <h2 className="text-muted-foreground">Select a channel</h2>
            )}
          </div>
          <NotificationBell />
        </header>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}
