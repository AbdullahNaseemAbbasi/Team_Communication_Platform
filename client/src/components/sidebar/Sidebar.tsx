"use client";

import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-64 h-full bg-slate-900 text-white flex flex-col">
      <div className="p-4 font-bold text-lg border-b border-slate-700">
        TeamChat
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase px-2 mb-2">
            Channels
          </p>
          <div className="text-sm text-slate-300 px-2 py-1.5 rounded hover:bg-slate-800 cursor-pointer">
            # general
          </div>
          <div className="text-sm text-slate-300 px-2 py-1.5 rounded hover:bg-slate-800 cursor-pointer">
            # random
          </div>
        </div>

        <Separator className="my-4 bg-slate-700" />

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase px-2 mb-2">
            Direct Messages
          </p>
          <div className="text-sm text-slate-300 px-2 py-1.5 rounded hover:bg-slate-800 cursor-pointer">
            No conversations yet
          </div>
        </div>
      </ScrollArea>

      <Separator className="bg-slate-700" />

      <div className="p-3 flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-slate-700 text-white text-xs">
            {user?.displayName ? getInitials(user.displayName) : "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {user?.displayName || "User"}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {user?.email || ""}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
