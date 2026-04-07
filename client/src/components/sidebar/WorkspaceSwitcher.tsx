"use client";

import { useWorkspaceStore } from "@/store/workspaceStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspace } =
    useWorkspaceStore();

  return (
    <div className="flex flex-col items-center gap-2 py-3 px-2 bg-slate-950">
      {workspaces.map((workspace) => (
        <Tooltip key={workspace._id}>
          <TooltipTrigger>
            <button
              onClick={() => setActiveWorkspace(workspace)}
              className={cn(
                "w-10 h-10 rounded-xl transition-all duration-200",
                activeWorkspace?._id === workspace._id
                  ? "rounded-2xl ring-2 ring-white"
                  : "hover:rounded-xl opacity-70 hover:opacity-100"
              )}
            >
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-indigo-600 text-white text-sm font-bold">
                  {workspace.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{workspace.name}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
