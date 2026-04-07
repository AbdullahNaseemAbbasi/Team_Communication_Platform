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

export interface WorkspaceMember {
  user: User;
  role: "owner" | "admin" | "member" | "guest";
  joinedAt: string;
}

export interface WorkspaceSettings {
  defaultChannel: string | null;
  fileUploadLimit: number;
  allowGuests: boolean;
}

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  owner: User;
  members: WorkspaceMember[];
  inviteCode: string;
  settings: WorkspaceSettings;
  createdAt: string;
}

export interface Channel {
  _id: string;
  workspace: string;
  name: string;
  description: string;
  topic: string;
  type: "public" | "private" | "dm";
  category: string;
  members: User[];
  pinnedMessages: string[];
  createdBy: User;
  createdAt: string;
}

export interface MessageAttachment {
  url: string;
  filename: string;
  fileType: string;
  size: number;
}

export interface MessageReaction {
  emoji: string;
  users: string[];
}

export interface MessageThread {
  parentMessage: string | null;
  replyCount: number;
  lastReplyAt: string | null;
}

export interface Message {
  _id: string;
  channel: string;
  sender: User;
  content: string;
  type: "text" | "image" | "file" | "system";
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  thread: MessageThread;
  mentions: User[];
  edited: boolean;
  editedAt: string | null;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TypingUser {
  userId: string;
  channelId: string;
  isTyping: boolean;
}
