"use client";

import { useState, useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function NotificationBell() {
  const { notifications, unreadCount, fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const [open, setOpen] = useState(false);

  useEffect(() => { fetchUnreadCount(); }, [fetchUnreadCount]);
  useEffect(() => { if (open) fetchNotifications(); }, [open, fetchNotifications]);

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "now";
    if (m < 60) return `${m}m`;
    const h = Math.floor(diff / 3600000);
    if (h < 24) return `${h}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "mention": return "@";
      case "reply": return "↩";
      case "invite": return "✉";
      case "dm": return "💬";
      default: return "🔔";
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="relative p-2 rounded-md hover:bg-white/10 text-[#949ba4] hover:text-white transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="absolute -top-0.5 -right-0.5 h-4 min-w-4 flex items-center justify-center text-[9px] px-1 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 bg-[#2b2d31] border-[#1f2023]">
        <div className="flex items-center justify-between p-3 border-b border-[#1f2023]">
          <h3 className="font-bold text-sm text-white">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-[11px] text-[#00a8fc] hover:text-white hover:bg-white/10" onClick={() => markAllAsRead()}>
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <span className="text-3xl">🔕</span>
              <p className="text-[#949ba4] text-sm mt-2">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => { if (!n.read) markAsRead(n._id); }}
                className={`w-full text-left p-3 border-b border-[#1f2023] hover:bg-white/5 transition-colors ${!n.read ? "bg-indigo-500/5" : ""}`}
              >
                <div className="flex gap-2">
                  <span className="text-sm shrink-0 mt-0.5">{getIcon(n.type)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-medium text-white truncate">{n.title}</p>
                      <span className="text-[10px] text-[#949ba4] shrink-0 ml-2">{formatTime(n.createdAt)}</span>
                    </div>
                    <p className="text-[12px] text-[#949ba4] truncate">{n.body}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2" />}
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
