"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import ChannelList from "./ChannelList";
import CreateWorkspaceModal from "@/components/workspace/CreateWorkspaceModal";
import JoinWorkspaceModal from "@/components/workspace/JoinWorkspaceModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { activeWorkspace, fetchWorkspaces } = useWorkspaceStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <TooltipProvider>
      <div className="h-full flex">
        <div className="w-[68px] bg-[#1a1d21] flex flex-col items-center py-3 gap-2">
          <WorkspaceSwitcher />
          <Separator className="w-8 bg-white/10 my-1" />
          <button onClick={() => setShowCreate(true)} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-indigo-500 text-white/60 hover:text-white flex items-center justify-center text-xl transition-all hover:rounded-2xl">+</button>
          <button onClick={() => setShowJoin(true)} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-green-600 text-white/60 hover:text-white flex items-center justify-center text-sm font-bold transition-all hover:rounded-2xl">J</button>
        </div>

        <div className="w-60 bg-[#2b2d31] text-white flex flex-col">
          <div className="h-12 px-4 flex items-center border-b border-white/5 shadow-sm">
            <h2 className="font-bold text-[15px] truncate">{activeWorkspace?.name || "TeamChat"}</h2>
          </div>

          <ChannelList />

          <Separator className="bg-white/5" />
          <div className="p-2 flex items-center gap-2 bg-[#232428]">
            <Avatar className="h-8 w-8">
              {user?.avatar && <AvatarImage src={user.avatar} />}
              <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                {user?.displayName ? getInitials(user.displayName) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold truncate">{user?.displayName}</p>
              <p className="text-[10px] text-[#949ba4] truncate">Online</p>
            </div>
            <button onClick={logout} className="text-[#949ba4] hover:text-white p-1.5 rounded hover:bg-white/10 transition-colors" title="Logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>

        <CreateWorkspaceModal open={showCreate} onClose={() => setShowCreate(false)} />
        <JoinWorkspaceModal open={showJoin} onClose={() => setShowJoin(false)} />
      </div>
    </TooltipProvider>
  );
}
