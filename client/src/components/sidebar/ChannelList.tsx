"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ChannelList() {
  const {
    channels,
    activeChannel,
    activeWorkspace,
    setActiveChannel,
    createChannel,
  } = useWorkspaceStore();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const grouped: Record<string, typeof channels> = {};
  channels.forEach((channel) => {
    if (channel.type === "dm") return;
    const cat = channel.category || "Channels";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(channel);
  });

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim() || !activeWorkspace) return;

    setIsCreating(true);
    try {
      const channel = await createChannel({
        name: channelName.trim(),
        workspaceId: activeWorkspace._id,
      });
      setChannelName("");
      setShowCreate(false);
      setActiveChannel(channel);
      router.push(
        `/workspace/${activeWorkspace._id}/channel/${channel._id}`,
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleChannelClick = (channel: (typeof channels)[0]) => {
    setActiveChannel(channel);
    if (activeWorkspace) {
      router.push(
        `/workspace/${activeWorkspace._id}/channel/${channel._id}`,
      );
    }
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-4">
        <div className="flex items-center justify-between px-2">
          <p className="text-xs font-semibold text-slate-400 uppercase">
            Channels
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="text-slate-400 hover:text-white text-lg leading-none"
          >
            +
          </button>
        </div>

        {Object.entries(grouped).map(([category, channelList]) => (
          <div key={category}>
            {category !== "Channels" && (
              <p className="text-xs font-semibold text-slate-400 uppercase px-2 mb-1">
                {category}
              </p>
            )}
            {channelList.map((channel) => (
              <button
                key={channel._id}
                onClick={() => handleChannelClick(channel)}
                className={cn(
                  "w-full text-left text-sm px-2 py-1.5 rounded transition-colors",
                  activeChannel?._id === channel._id
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )}
              >
                <span className="text-slate-500 mr-1">
                  {channel.type === "private" ? "🔒" : "#"}
                </span>
                {channel.name}
              </button>
            ))}
          </div>
        ))}

        {channels.length === 0 && (
          <p className="text-xs text-slate-500 px-2">No channels yet</p>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a channel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateChannel} className="space-y-4">
            <Input
              placeholder="e.g. general"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              maxLength={80}
              disabled={isCreating}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !channelName.trim()}
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
}
