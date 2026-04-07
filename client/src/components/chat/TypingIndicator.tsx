"use client";

import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";

interface Props {
  channelId: string;
}

export default function TypingIndicator({ channelId }: Props) {
  const { typingUsers } = useChatStore();
  const { user } = useAuthStore();

  const typing = typingUsers.filter(
    (t) => t.channelId === channelId && t.userId !== user?._id && t.isTyping,
  );

  if (typing.length === 0) return <div className="h-6 px-4" />;

  return (
    <div className="h-6 px-4 flex items-center gap-1">
      <div className="flex gap-0.5">
        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-[11px] text-[#949ba4] font-medium">
        {typing.length === 1 ? "Someone is typing..." : `${typing.length} people are typing...`}
      </span>
    </div>
  );
}
