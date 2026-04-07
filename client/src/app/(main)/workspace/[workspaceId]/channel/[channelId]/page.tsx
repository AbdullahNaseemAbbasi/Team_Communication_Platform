"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useChatStore } from "@/store/chatStore";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import TypingIndicator from "@/components/chat/TypingIndicator";
import ThreadPanel from "@/components/chat/ThreadPanel";

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.channelId as string;
  const { setActiveChannel, channels, activeChannel } = useWorkspaceStore();
  const { clearMessages } = useChatStore();
  const [threadMessageId, setThreadMessageId] = useState<string | null>(null);

  const { sendMessage, editMessage, deleteMessage, startTyping, stopTyping, addReaction } = useSocket(channelId);

  useEffect(() => {
    const channel = channels.find((c) => c._id === channelId);
    if (channel) setActiveChannel(channel);
    return () => { clearMessages(); };
  }, [channelId, channels, setActiveChannel, clearMessages]);

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <MessageList channelId={channelId} onEdit={editMessage} onDelete={deleteMessage} onReaction={addReaction} onThreadOpen={setThreadMessageId} />
        <TypingIndicator channelId={channelId} />
        <MessageInput channelId={channelId} channelName={activeChannel?.name} onSend={sendMessage} onTypingStart={startTyping} onTypingStop={stopTyping} />
      </div>

      {threadMessageId && (
        <ThreadPanel parentMessageId={threadMessageId} channelId={channelId} onClose={() => setThreadMessageId(null)} onSendReply={sendMessage} onReaction={addReaction} />
      )}
    </div>
  );
}
