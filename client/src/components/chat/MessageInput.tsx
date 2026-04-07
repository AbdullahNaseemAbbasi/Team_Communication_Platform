"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  channelId: string;
  onSend: (data: { channelId: string; content: string }) => void;
  onTypingStart: (channelId: string) => void;
  onTypingStop: (channelId: string) => void;
}

export default function MessageInput({
  channelId,
  onSend,
  onTypingStart,
  onTypingStop,
}: Props) {
  const [content, setContent] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart(channelId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTypingStop(channelId);
    }, 2000);
  }, [channelId, onTypingStart, onTypingStop]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSend({ channelId, content: content.trim() });
    setContent("");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop(channelId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" disabled={!content.trim()} size="sm">
          Send
        </Button>
      </div>
    </form>
  );
}
