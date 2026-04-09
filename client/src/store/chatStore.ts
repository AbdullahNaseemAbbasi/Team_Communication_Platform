import { create } from "zustand";
import api from "@/lib/api";
import type { Message, TypingUser } from "@/types";

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  hasMore: boolean;
  typingUsers: TypingUser[];

  fetchMessages: (channelId: string, cursor?: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  removeMessage: (messageId: string) => void;
  clearMessages: () => void;
  setTypingUser: (data: TypingUser) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  hasMore: true,
  typingUsers: [],

  fetchMessages: async (channelId, cursor) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams({ channelId, limit: "50" });
      if (cursor) params.append("cursor", cursor);

      const { data } = await api.get<Message[]>(
        `/messages?${params.toString()}`,
      );

      if (cursor) {
        set((state) => ({
          messages: [...state.messages, ...data],
          hasMore: data.length === 50,
        }));
      } else {
        set({ messages: data, hasMore: data.length === 50 });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  addMessage: (message) => {
    set((state) => {
      const exists = state.messages.some((m) => m._id === message._id);
      if (exists) return state;
      return { messages: [message, ...state.messages] };
    });
  },

  updateMessage: (message) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === message._id ? message : m,
      ),
    }));
  },

  removeMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === messageId ? { ...m, deleted: true, content: "" } : m,
      ),
    }));
  },

  clearMessages: () => {
    set({ messages: [], hasMore: true, typingUsers: [] });
  },

  setTypingUser: (data) => {
    set((state) => {
      if (!data.isTyping) {
        return {
          typingUsers: state.typingUsers.filter(
            (t) => t.userId !== data.userId,
          ),
        };
      }

      const exists = state.typingUsers.some(
        (t) => t.userId === data.userId && t.channelId === data.channelId,
      );
      if (exists) return state;

      return { typingUsers: [...state.typingUsers, data] };
    });
  },
}));
