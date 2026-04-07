"use client";

import { useState } from "react";
import type { Message } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Props {
  message: Message;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onThreadOpen: (messageId: string) => void;
}

export default function MessageItem({
  message,
  onEdit,
  onDelete,
  onReaction,
  onThreadOpen,
}: Props) {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);

  const isOwn = user?._id === message.sender._id;

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editContent.trim()) {
      onEdit(message._id, editContent);
      setIsEditing(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (message.deleted) {
    return (
      <div className="px-4 py-1 opacity-50 italic text-sm text-muted-foreground">
        This message was deleted
      </div>
    );
  }

  return (
    <div
      className="group px-4 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex gap-3">
        <Avatar className="h-9 w-9 mt-0.5 shrink-0">
          {message.sender.avatar && (
            <AvatarImage src={message.sender.avatar} />
          )}
          <AvatarFallback className="text-xs bg-slate-200 dark:bg-slate-700">
            {getInitials(message.sender.displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm">
              {message.sender.displayName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.createdAt)}
            </span>
            {message.edited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="mt-1">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-slate-800 dark:border-slate-600"
                autoFocus
              />
              <div className="flex gap-2 mt-1">
                <Button type="submit" size="sm" className="h-6 text-xs">
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.attachments.map((att, i) =>
                att.fileType.startsWith("image/") ? (
                  <img
                    key={i}
                    src={att.url}
                    alt={att.filename}
                    className="max-w-xs rounded border"
                  />
                ) : (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    {att.filename}
                  </a>
                ),
              )}
            </div>
          )}

          {message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {message.reactions.map((reaction) => (
                <button
                  key={reaction.emoji}
                  onClick={() => onReaction(message._id, reaction.emoji)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                    reaction.users.includes(user?._id || "")
                      ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                      : "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                  }`}
                >
                  {reaction.emoji} {reaction.users.length}
                </button>
              ))}
            </div>
          )}

          {message.thread.replyCount > 0 && (
            <button
              onClick={() => onThreadOpen(message._id)}
              className="text-xs text-blue-500 hover:underline mt-1"
            >
              {message.thread.replyCount}{" "}
              {message.thread.replyCount === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>
      </div>

      {showActions && !isEditing && (
        <div className="absolute top-0 right-4 flex gap-0.5 bg-white dark:bg-slate-800 border rounded shadow-sm p-0.5">
          <button
            onClick={() => onReaction(message._id, "👍")}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-sm"
          >
            👍
          </button>
          <button
            onClick={() => onThreadOpen(message._id)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-xs"
          >
            💬
          </button>
          {isOwn && (
            <>
              <button
                onClick={() => {
                  setEditContent(message.content);
                  setIsEditing(true);
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-xs"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(message._id)}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-xs"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
