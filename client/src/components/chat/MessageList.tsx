"use client";

import { useEffect, useRef, useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import MessageItem from "./MessageItem";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  channelId: string;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onThreadOpen: (messageId: string) => void;
}

export default function MessageList({
  channelId,
  onEdit,
  onDelete,
  onReaction,
  onThreadOpen,
}: Props) {
  const { messages, isLoading, hasMore, fetchMessages } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  useEffect(() => {
    fetchMessages(channelId);
  }, [channelId, fetchMessages]);

  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  const handleLoadMore = useCallback(() => {
    if (isLoading || !hasMore || messages.length === 0) return;
    const oldest = messages[messages.length - 1];
    fetchMessages(channelId, oldest.createdAt);
  }, [isLoading, hasMore, messages, channelId, fetchMessages]);

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <ScrollArea className="flex-1">
      <div className="py-4">
        {hasMore && (
          <div className="text-center py-2">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="text-xs text-blue-500 hover:underline disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Load older messages"}
            </button>
          </div>
        )}

        {sortedMessages.map((message) => (
          <MessageItem
            key={message._id}
            message={message}
            onEdit={onEdit}
            onDelete={onDelete}
            onReaction={onReaction}
            onThreadOpen={onThreadOpen}
          />
        ))}

        {messages.length === 0 && !isLoading && (
          <div className="text-center text-muted-foreground text-sm py-12">
            No messages yet. Start the conversation!
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
