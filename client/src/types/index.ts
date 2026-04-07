// ============================================
// USER TYPES
// ============================================

// User ka online status — 4 possible values
// TypeScript "union type" = variable sirf in 4 values mein se ek ho sakti hai
export type UserStatus = "online" | "offline" | "away" | "dnd";

// Theme preference — dark mode, light mode, ya system default
export type ThemePreference = "light" | "dark" | "system";

// User ka notification preferences
// Nested object — preferences ke andar notifications ke andar ye 3 booleans
export interface NotificationPreferences {
  email: boolean;   // Email notifications on/off
  push: boolean;    // Browser push notifications on/off
  sound: boolean;   // Notification sound on/off
}

// Do Not Disturb schedule — kab se kab tak notifications mute rahein
export interface DndSchedule {
  enabled: boolean;  // DND schedule active hai ya nahi
  start: string;     // Start time e.g. "22:00"
  end: string;       // End time e.g. "08:00"
}

// User preferences — theme + notifications + DND sab ek jagah
export interface UserPreferences {
  notifications: NotificationPreferences;
  theme: ThemePreference;
  dndSchedule: DndSchedule;
}

// Main User interface — backend ke User schema ka frontend mirror
// Backend mein Mongoose schema hai, frontend mein TypeScript interface hai
// Dono ka shape same hona chahiye taake data correctly flow kare
export interface User {
  _id: string;                    // MongoDB ObjectId (string form mein aata hai frontend pe)
  email: string;
  displayName: string;
  avatar: string | null;          // Null agar user ne avatar upload nahi kiya
  status: UserStatus;
  customStatus: string | null;    // "In a meeting", "On vacation", etc.
  lastSeen: string;               // ISO date string — backend Date → frontend string
  emailVerified: boolean;
  googleId: string | null;        // Null agar Google OAuth use nahi kiya
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// AUTH TYPES
// ============================================

// Login/Register form se jo data jaata hai backend ko
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
}

export interface VerifyEmailData {
  email: string;
  otp: string;
}

// Backend se jo response aata hai login/register ke baad
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// Generic API error response
export interface ApiError {
  message: string;
  statusCode: number;
}
