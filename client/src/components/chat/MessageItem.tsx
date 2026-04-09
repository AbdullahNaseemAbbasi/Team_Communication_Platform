"use client";

import { useState } from "react";
import Image from "next/image";
import type { Message } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  message: Message;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onThreadOpen: (messageId: string) => void;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "😢", "🔥"];

export default function MessageItem({ message, onEdit, onDelete, onReaction, onThreadOpen }: Props) {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);

  const isOwn = user?._id === message.sender._id;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (isToday) return `Today at ${time}`;
    return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} at ${time}`;
  };

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  if (message.deleted) {
    return (
      <div className="px-4 py-1 flex items-center gap-3">
        <div className="w-10" />
        <p className="text-[13px] text-[#949ba4] italic">This message was deleted</p>
      </div>
    );
  }

  return (
    <div
      className="group relative px-4 py-1 hover:bg-[#2e3035] transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 mt-0.5 shrink-0 rounded-full">
          {message.sender.avatar && <AvatarImage src={message.sender.avatar} />}
          <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">{getInitials(message.sender.displayName)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-[15px] text-white hover:underline cursor-pointer">{message.sender.displayName}</span>
            <span className="text-[11px] text-[#949ba4]">{formatTime(message.createdAt)}</span>
            {message.edited && <span className="text-[10px] text-[#949ba4]">(edited)</span>}
          </div>

          {isEditing ? (
            <div className="mt-1">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { onEdit(message._id, editContent); setIsEditing(false); }
                  if (e.key === "Escape") setIsEditing(false);
                }}
                className="w-full px-3 py-2 text-sm bg-[#383a40] text-white border border-[#4752c4] rounded-lg focus:outline-none"
                autoFocus
              />
              <p className="text-[11px] text-[#949ba4] mt-1">Enter to save · Escape to cancel</p>
            </div>
          ) : (
            <p className="text-[15px] text-[#dbdee1] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.attachments.map((att, i) =>
                att.fileType.startsWith("image/") ? (
                  <Image
                    key={i}
                    src={att.url}
                    alt={att.filename}
                    width={400}
                    height={300}
                    unoptimized
                    className="max-w-sm h-auto rounded-lg border border-[#1f2023]"
                  />
                ) : (
                  <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#2b2d31] border border-[#1f2023] rounded-lg p-3 hover:bg-[#36393f] transition-colors">
                    <span>📎</span>
                    <span className="text-sm text-[#00a8fc] hover:underline">{att.filename}</span>
                    <span className="text-xs text-[#949ba4]">{(att.size / 1024).toFixed(0)} KB</span>
                  </a>
                )
              )}
            </div>
          )}

          {message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {message.reactions.map((r) => (
                <button
                  key={r.emoji}
                  onClick={() => onReaction(message._id, r.emoji)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] border transition-colors ${
                    r.users.includes(user?._id || "")
                      ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                      : "bg-[#2b2d31] border-[#3f4147] text-[#dbdee1] hover:border-[#949ba4]"
                  }`}
                >
                  {r.emoji} <span className="font-medium">{r.users.length}</span>
                </button>
              ))}
            </div>
          )}

          {message.thread.replyCount > 0 && (
            <button onClick={() => onThreadOpen(message._id)} className="flex items-center gap-1.5 mt-1.5 text-[13px] text-[#00a8fc] hover:underline">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {message.thread.replyCount} {message.thread.replyCount === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>
      </div>

      {showActions && !isEditing && (
        <div className="absolute -top-3 right-4 flex bg-[#2b2d31] border border-[#1f2023] rounded-lg shadow-lg overflow-hidden">
          {QUICK_REACTIONS.slice(0, 3).map((emoji) => (
            <button key={emoji} onClick={() => onReaction(message._id, emoji)} className="p-1.5 hover:bg-[#36393f] text-sm transition-colors">{emoji}</button>
          ))}
          <button onClick={() => onThreadOpen(message._id)} className="p-1.5 hover:bg-[#36393f] text-[#949ba4] hover:text-white transition-colors" title="Reply in thread">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </button>
          {isOwn && (
            <>
              <button onClick={() => { setEditContent(message.content); setIsEditing(true); }} className="p-1.5 hover:bg-[#36393f] text-[#949ba4] hover:text-white transition-colors" title="Edit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button onClick={() => onDelete(message._id)} className="p-1.5 hover:bg-red-500/20 text-[#949ba4] hover:text-red-400 transition-colors" title="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
