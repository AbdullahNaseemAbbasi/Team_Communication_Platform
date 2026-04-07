import { create } from "zustand";
import api from "@/lib/api";
import type { Workspace, Channel } from "@/types";

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  channels: Channel[];
  activeChannel: Channel | null;
  isLoading: boolean;

  fetchWorkspaces: () => Promise<void>;
  setActiveWorkspace: (workspace: Workspace) => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<Workspace>;
  joinWorkspace: (inviteCode: string) => Promise<Workspace>;
  fetchChannels: (workspaceId: string) => Promise<void>;
  setActiveChannel: (channel: Channel | null) => void;
  createChannel: (data: {
    name: string;
    workspaceId: string;
    description?: string;
    type?: string;
    category?: string;
  }) => Promise<Channel>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  channels: [],
  activeChannel: null,
  isLoading: false,

  fetchWorkspaces: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<Workspace[]>("/workspaces");
      set({ workspaces: data });

      if (data.length > 0 && !get().activeWorkspace) {
        const first = data[0];
        set({ activeWorkspace: first });
        await get().fetchChannels(first._id);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveWorkspace: async (workspace) => {
    set({ activeWorkspace: workspace, channels: [], activeChannel: null });
    await get().fetchChannels(workspace._id);
  },

  createWorkspace: async (name, description) => {
    const { data } = await api.post<Workspace>("/workspaces", {
      name,
      description,
    });
    set((state) => ({ workspaces: [...state.workspaces, data] }));
    return data;
  },

  joinWorkspace: async (inviteCode) => {
    const { data } = await api.post<Workspace>(
      `/workspaces/join/${inviteCode}`,
    );
    set((state) => ({ workspaces: [...state.workspaces, data] }));
    return data;
  },

  fetchChannels: async (workspaceId) => {
    try {
      const { data } = await api.get<Channel[]>(
        `/channels?workspaceId=${workspaceId}`,
      );
      set({ channels: data });

      if (data.length > 0 && !get().activeChannel) {
        set({ activeChannel: data[0] });
      }
    } catch {
      set({ channels: [] });
    }
  },

  setActiveChannel: (channel) => {
    set({ activeChannel: channel });
  },

  createChannel: async (channelData) => {
    const { data } = await api.post<Channel>("/channels", channelData);
    set((state) => ({ channels: [...state.channels, data] }));
    return data;
  },
}));
