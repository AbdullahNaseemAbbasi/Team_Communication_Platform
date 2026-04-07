"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import ChannelList from "./ChannelList";
import CreateWorkspaceModal from "@/components/workspace/CreateWorkspaceModal";
import JoinWorkspaceModal from "@/components/workspace/JoinWorkspaceModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <TooltipProvider>
      <div className="h-full flex">
        <WorkspaceSwitcher />

        <div className="w-56 h-full bg-slate-900 text-white flex flex-col">
          <div className="p-3 border-b border-slate-700">
            <h2 className="font-bold text-sm truncate">
              {activeWorkspace?.name || "No workspace"}
            </h2>
            <div className="flex gap-1 mt-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-slate-400 hover:text-white hover:bg-slate-800 h-7 px-2"
                onClick={() => setShowCreate(true)}
              >
                + Create
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-slate-400 hover:text-white hover:bg-slate-800 h-7 px-2"
                onClick={() => setShowJoin(true)}
              >
                Join
              </Button>
            </div>
          </div>

          <ChannelList />

          <Separator className="bg-slate-700" />

          <div className="p-3 flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-slate-700 text-white text-xs">
                {user?.displayName ? getInitials(user.displayName) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {user?.displayName || "User"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs h-7 px-2"
            >
              Logout
            </Button>
          </div>
        </div>

        <CreateWorkspaceModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
        />
        <JoinWorkspaceModal
          open={showJoin}
          onClose={() => setShowJoin(false)}
        />
      </div>
    </TooltipProvider>
  );
}
