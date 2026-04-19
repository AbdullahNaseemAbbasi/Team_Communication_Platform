"use client";

import { useState, useRef, useCallback } from "react";

interface Props {
  channelId: string;
  channelName?: string;
  onSend: (data: { channelId: string; content: string }) => void; 
  onTypingStart: (channelId: string) => void; 
  onTypingStop: (channelId: string) => void; 
} 

export default function MessageInput({ channelId, channelName, onSend, onTypingStart, onTypingStop }: Props) {
  const [content, setContent] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart(channelId);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTypingStop(channelId);
    }, 2000);
  }, [channelId, onTypingStart, onTypingStop]);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSend({ channelId, content: content.trim() });
    setContent("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current) { isTypingRef.current = false; onTypingStop(channelId); }
  };

  return (
    <div className="px-4 pb-6 pt-1">
      <div className="bg-[#383a40] rounded-lg border border-transparent focus-within:border-[#4752c4] transition-colors flex items-center">
        <textarea
          value={content}
          onChange={(e) => { setContent(e.target.value); handleTyping(); }}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
          placeholder={`Message ${channelName ? "#" + channelName : "..."}`}
          rows={1}
          className="flex-1 resize-none px-4 py-3 bg-transparent text-[#dbdee1] text-[15px] placeholder-[#6d6f78] focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="mr-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  );
}
