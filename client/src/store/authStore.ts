import { create } from "zustand";
import api from "@/lib/api";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  VerifyEmailData,
  AuthResponse,
} from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  register: (credentials: RegisterCredentials) => Promise<{ message: string }>;
  verifyEmail: (data: VerifyEmailData) => Promise<{ message: string }>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  register: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/register", credentials);
      return data;
    } finally {
      set({ isLoading: false });
    }
  },

  verifyEmail: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post("/auth/verify-email", data);
      return response.data;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<AuthResponse>("/auth/login", credentials);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      const userResponse = await api.get<User>("/auth/me");

      set({
        user: userResponse.data,
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    set({ isLoading: true });
    try {
      const { data } = await api.get<User>("/auth/me");
      set({ user: data, isAuthenticated: true });
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
}));
