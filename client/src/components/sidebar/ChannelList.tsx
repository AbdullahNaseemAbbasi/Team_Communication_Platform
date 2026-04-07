"use client";

import { useWorkspaceStore } from "@/store/workspaceStore";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChannelList() {
  const { channels, activeChannel, setActiveChannel } = useWorkspaceStore();

  const grouped: Record<string, typeof channels> = {};
  channels.forEach((channel) => {
    if (channel.type === "dm") return;
    const cat = channel.category || "Channels";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(channel);
  });

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-4">
        {Object.entries(grouped).map(([category, channelList]) => (
          <div key={category}>
            <p className="text-xs font-semibold text-slate-400 uppercase px-2 mb-1">
              {category}
            </p>
            {channelList.map((channel) => (
              <button
                key={channel._id}
                onClick={() => setActiveChannel(channel)}
                className={cn(
                  "w-full text-left text-sm px-2 py-1.5 rounded transition-colors",
                  activeChannel?._id === channel._id
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
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
    </ScrollArea>
  );
}
