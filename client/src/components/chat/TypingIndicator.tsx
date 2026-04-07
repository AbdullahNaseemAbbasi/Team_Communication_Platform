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

  if (typing.length === 0) return null;

  return (
    <div className="px-4 py-1 text-xs text-muted-foreground animate-pulse">
      {typing.length === 1
        ? "Someone is typing..."
        : `${typing.length} people are typing...`}
    </div>
  );
}
