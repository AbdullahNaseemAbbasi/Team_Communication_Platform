import { useEffect, useRef, useCallback } from "react";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import type { Message, MessageAttachment, Notification, TypingUser } from "@/types";
import type { Socket } from "socket.io-client";

export function useSocket(channelId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const { addMessage, updateMessage, removeMessage, setTypingUser } =
    useChatStore();
  const { isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = connectSocket(); 
    socketRef.current = socket;

    socket.on("message:new", (message: Message) => {
      addMessage(message);
    });

    socket.on("message:updated", (message: Message) => {
      updateMessage(message);
    });

    socket.on("message:deleted", (data: { messageId: string }) => {
      removeMessage(data.messageId);
    });

    socket.on("user:typing", (data: TypingUser) => {
      setTypingUser(data);
    });

    socket.on("notification:new", (notification: Notification) => {
      addNotification(notification);
    });

    return () => {
      socket.off("message:new");
      socket.off("message:updated");
      socket.off("message:deleted");
      socket.off("user:typing");
      socket.off("notification:new");
      disconnectSocket();
    };
  }, [isAuthenticated, addMessage, updateMessage, removeMessage, setTypingUser, addNotification]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !channelId) return;

    socket.emit("channel:join", { channelId });

    return () => {
      socket.emit("channel:leave", { channelId });
    };
  }, [channelId]);

  const sendMessage = useCallback(
    (data: {
      channelId: string;
      content: string;
      parentMessageId?: string;
      attachments?: MessageAttachment[];
      mentions?: string[];
    }) => {
      socketRef.current?.emit("message:send", data);
    },
    [],
  );

  const editMessage = useCallback(
    (messageId: string, content: string) => {
      socketRef.current?.emit("message:edit", { messageId, content });
    },
    [],
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      socketRef.current?.emit("message:delete", { messageId });
    },
    [],
  );

  const startTyping = useCallback(
    (channelId: string) => {
      socketRef.current?.emit("typing:start", { channelId });
    },
    [],
  );

  const stopTyping = useCallback(
    (channelId: string) => {
      socketRef.current?.emit("typing:stop", { channelId });
    },
    [],
  );

  const addReaction = useCallback(
    (messageId: string, emoji: string) => {
      socketRef.current?.emit("message:reaction", { messageId, emoji });
    },
    [],
  );

  return {
    sendMessage,
    editMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    addReaction,
  };
}
