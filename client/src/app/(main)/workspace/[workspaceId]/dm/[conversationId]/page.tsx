"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useChatStore } from "@/store/chatStore";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import TypingIndicator from "@/components/chat/TypingIndicator";
import ThreadPanel from "@/components/chat/ThreadPanel";

export default function DMPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { clearMessages } = useChatStore();
  const [threadMessageId, setThreadMessageId] = useState<string | null>(null);

  const {
    sendMessage,
    editMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    addReaction,
  } = useSocket(conversationId);

  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, [conversationId, clearMessages]);

  return (
    <div className="flex h-full -m-6">
      <div className="flex-1 flex flex-col">
        <MessageList
          channelId={conversationId}
          onEdit={editMessage}
          onDelete={deleteMessage}
          onReaction={addReaction}
          onThreadOpen={setThreadMessageId}
        />
        <TypingIndicator channelId={conversationId} />
        <MessageInput
          channelId={conversationId}
          onSend={sendMessage}
          onTypingStart={startTyping}
          onTypingStop={stopTyping}
        />
      </div>

      {threadMessageId && (
        <ThreadPanel
          parentMessageId={threadMessageId}
          channelId={conversationId}
          onClose={() => setThreadMessageId(null)}
          onSendReply={sendMessage}
          onReaction={addReaction}
        />
      )}
    </div>
  );
}
