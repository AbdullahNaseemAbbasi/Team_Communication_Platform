"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/chatStore";
import MessageItem from "./MessageItem";

interface Props {
  channelId: string;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onThreadOpen: (messageId: string) => void;
}

export default function MessageList({ channelId, onEdit, onDelete, onReaction, onThreadOpen }: Props) {
  const { messages, isLoading, hasMore, fetchMessages } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  useEffect(() => { fetchMessages(channelId); }, [channelId, fetchMessages]);

  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevCountRef.current = messages.length;
  }, [messages.length]);

  const sorted = [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="flex-1 overflow-y-auto">
      {hasMore && messages.length > 0 && (
        <div className="text-center py-3">
          <button
            onClick={() => {
              if (messages.length > 0) {
                const oldest = sorted[0];
                fetchMessages(channelId, oldest.createdAt);
              }
            }}
            disabled={isLoading}
            className="text-xs text-[#00a8fc] hover:underline disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Load older messages"}
          </button>
        </div>
      )}

      {sorted.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
            <span className="text-3xl">💬</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Welcome to the channel!</h3>
          <p className="text-[#949ba4] text-sm">This is the beginning of the conversation. Send a message to get started.</p>
        </div>
      )}

      <div className="py-2">
        {sorted.map((message) => (
          <MessageItem key={message._id} message={message} onEdit={onEdit} onDelete={onDelete} onReaction={onReaction} onThreadOpen={onThreadOpen} />
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
