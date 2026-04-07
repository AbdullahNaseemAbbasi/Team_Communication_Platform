"use client";

import { useWorkspaceStore } from "@/store/workspaceStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaceStore();

  return (
    <>
      {workspaces.map((workspace) => (
        <Tooltip key={workspace._id}>
          <TooltipTrigger
            onClick={() => setActiveWorkspace(workspace)}
            className="relative group"
          >
            <div className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[22px] w-1 rounded-r bg-white transition-all",
              activeWorkspace?._id === workspace._id ? "h-10" : "h-0 group-hover:h-5"
            )} />
            <Avatar className={cn(
              "w-12 h-12 transition-all",
              activeWorkspace?._id === workspace._id
                ? "rounded-2xl"
                : "rounded-3xl group-hover:rounded-2xl"
            )}>
              {workspace.logo && <AvatarImage src={workspace.logo} />}
              <AvatarFallback className={cn(
                "text-white font-bold text-lg transition-all",
                activeWorkspace?._id === workspace._id
                  ? "bg-indigo-600 rounded-2xl"
                  : "bg-[#36393f] rounded-3xl group-hover:rounded-2xl group-hover:bg-indigo-600"
              )}>
                {workspace.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-semibold">
            {workspace.name}
          </TooltipContent>
        </Tooltip>
      ))}
    </>
  );
}
