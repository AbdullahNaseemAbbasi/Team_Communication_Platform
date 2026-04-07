export type UserStatus = "online" | "offline" | "away" | "dnd";

export type ThemePreference = "light" | "dark" | "system";

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sound: boolean;
}

export interface DndSchedule {
  enabled: boolean;
  start: string;
  end: string;
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  theme: ThemePreference;
  dndSchedule: DndSchedule;
}

export interface User {
  _id: string;
  email: string;
  displayName: string;
  avatar: string | null;
  status: UserStatus;
  customStatus: string | null;
  lastSeen: string;
  emailVerified: boolean;
  googleId: string | null;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

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

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
