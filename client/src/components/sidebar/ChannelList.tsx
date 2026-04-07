"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ChannelList() {
  const { channels, activeChannel, activeWorkspace, setActiveChannel, createChannel } = useWorkspaceStore();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState("public");
  const [isCreating, setIsCreating] = useState(false);

  const grouped: Record<string, typeof channels> = {};
  channels.forEach((channel) => {
    if (channel.type === "dm") return;
    const cat = channel.category || "Text Channels";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(channel);
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim() || !activeWorkspace) return;
    setIsCreating(true);
    try {
      const channel = await createChannel({ name: channelName.trim(), workspaceId: activeWorkspace._id, type: channelType });
      setChannelName("");
      setShowCreate(false);
      setActiveChannel(channel);
      router.push(`/workspace/${activeWorkspace._id}/channel/${channel._id}`);
    } finally { setIsCreating(false); }
  };

  const handleClick = (channel: (typeof channels)[0]) => {
    setActiveChannel(channel);
    if (activeWorkspace) router.push(`/workspace/${activeWorkspace._id}/channel/${channel._id}`);
  };

  return (
    <ScrollArea className="flex-1">
      <div className="px-2 py-3">
        {Object.entries(grouped).map(([category, list]) => (
          <div key={category} className="mb-4">
            <div className="flex items-center justify-between px-2 mb-1 group">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#949ba4]">{category}</p>
              <button onClick={() => setShowCreate(true)} className="text-[#949ba4] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Create channel">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
            {list.map((channel) => (
              <button
                key={channel._id}
                onClick={() => handleClick(channel)}
                className={cn(
                  "w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-[14px] transition-colors group/item",
                  activeChannel?._id === channel._id
                    ? "bg-white/10 text-white"
                    : "text-[#949ba4] hover:bg-white/5 hover:text-[#dbdee1]"
                )}
              >
                <span className="text-[#949ba4] text-[16px] w-5 text-center shrink-0">
                  {channel.type === "private" ? "🔒" : "#"}
                </span>
                <span className="truncate">{channel.name}</span>
              </button>
            ))}
          </div>
        ))}

        {channels.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#949ba4] text-sm mb-3">No channels yet</p>
            <Button size="sm" onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700 text-xs">
              Create Channel
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Channel Name</Label>
              <Input placeholder="e.g. general" value={channelName} onChange={(e) => setChannelName(e.target.value.toLowerCase().replace(/\s+/g, "-"))} maxLength={80} disabled={isCreating} autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setChannelType("public")} className={cn("flex-1 p-3 rounded-lg border text-sm text-left transition-colors", channelType === "public" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950" : "border-slate-200 dark:border-slate-700")}>
                  <span className="font-medium"># Public</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Anyone can join</p>
                </button>
                <button type="button" onClick={() => setChannelType("private")} className={cn("flex-1 p-3 rounded-lg border text-sm text-left transition-colors", channelType === "private" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950" : "border-slate-200 dark:border-slate-700")}>
                  <span className="font-medium">🔒 Private</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Invite only</p>
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={isCreating || !channelName.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                {isCreating ? "Creating..." : "Create Channel"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
}
