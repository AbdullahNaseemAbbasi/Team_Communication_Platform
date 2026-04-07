import { create } from "zustand";
import api from "@/lib/api";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  VerifyEmailData,
  AuthResponse,
} from "@/types";

// ============================================
// AUTH STORE — Authentication State Management
// ============================================
// Yeh store poore app mein auth state manage karta hai:
// - User logged in hai ya nahi?
// - User ka data kya hai?
// - Login/Register/Logout functions

// Pehle define karte hain ke store ka "shape" kya hoga
// TypeScript interface se har property aur function ka type define karte hain
interface AuthState {
  // === STATE (Data) ===
  user: User | null;          // Logged in user ka data (null = not logged in)
  isAuthenticated: boolean;   // Quick check: user logged in hai ya nahi
  isLoading: boolean;         // API call chal rahi hai? (button pe spinner dikhane ke liye)

  // === ACTIONS (Functions) ===
  register: (credentials: RegisterCredentials) => Promise<{ message: string }>;
  verifyEmail: (data: VerifyEmailData) => Promise<{ message: string }>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

// ============================================
// ZUSTAND STORE CREATE KARNA
// ============================================
// create() function ek store banata hai
// (set, get) = Zustand ke 2 helpers:
//   set() → state update karo (React ko re-render trigger hota hai)
//   get() → current state read karo (bina re-render ke)

export const useAuthStore = create<AuthState>((set) => ({
  // === INITIAL STATE ===
  // Jab app pehli baar load ho, yeh values hongi
  user: null,
  isAuthenticated: false,
  isLoading: false,

  // ============================================
  // REGISTER — New user signup
  // ============================================
  // Flow: Form data → Backend POST /auth/register → OTP email bhejta hai
  // Yeh function sirf register karta hai — login nahi karta
  // User ko verify-email page pe redirect karna hoga
  register: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/register", credentials);
      return data; // { message: "OTP sent to email" }
    } finally {
      // finally block HAMESHA chalta hai — chahe success ho ya error
      // Isliye loading false karna yahan safe hai
      set({ isLoading: false });
    }
  },

  // ============================================
  // VERIFY EMAIL — OTP se email confirm karna
  // ============================================
  // User register ke baad email pe OTP aata hai
  // Woh OTP yahan bhejta hai → backend verify karta hai
  verifyEmail: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post("/auth/verify-email", data);
      return response.data;
    } finally {
      set({ isLoading: false });
    }
  },

  // ============================================
  // LOGIN — User authentication
  // ============================================
  // Flow:
  // 1. Email + password backend ko bhejo
  // 2. Backend verify kare → tokens return kare
  // 3. Tokens localStorage mein save karo
  // 4. User data fetch karo (GET /auth/me)
  // 5. State update karo (user + isAuthenticated)
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      // Step 1: Backend se tokens lo
      const { data } = await api.post<AuthResponse>("/auth/login", credentials);

      // Step 2: Tokens browser ki localStorage mein save karo
      // localStorage = key-value storage jo browser band hone pe bhi rehta hai
      // Har future API call mein axios interceptor yahan se token uthayega
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Step 3: User profile data fetch karo
      // Ab token set ho chuka hai → api interceptor automatically attach karega
      const userResponse = await api.get<User>("/auth/me");

      // Step 4: Store update karo
      set({
        user: userResponse.data,
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // ============================================
  // LOGOUT — Session end karna
  // ============================================
  // 1. Tokens hata do localStorage se
  // 2. State reset karo
  // Simple hai — backend pe session invalidation baad mein add karenge
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null, isAuthenticated: false });
  },

  // ============================================
  // FETCH USER — Current user ka data reload karna
  // ============================================
  // Yeh tab use hota hai jab:
  // - App pehli baar load ho (check karo user logged in hai ya nahi)
  // - Profile update ke baad (fresh data chahiye)
  //
  // Agar localStorage mein token hai → backend se user data lo
  // Agar token nahi hai ya expired hai → silently fail (user not logged in)
  fetchUser: async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return; // Token nahi? Kuch mat karo

    set({ isLoading: true });
    try {
      const { data } = await api.get<User>("/auth/me");
      set({ user: data, isAuthenticated: true });
    } catch {
      // Token expired ya invalid → clean up karo
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  // ============================================
  // SET USER — Direct user state update
  // ============================================
  // Utility function — kisi bhi jagah se user update kar sakte hain
  // Profile edit ke baad useful hoga
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    // !!user = double negation = truthy check
    // user object hai → true, user null hai → false
  },
}));
