# Team Communication Platform — Complete Project Documentation

> A production-grade, full-stack team communication platform inspired by Slack and Discord. Built with Next.js 14, NestJS, MongoDB, Redis, and Socket.io — featuring real-time messaging, voice/video calls, workspaces, and a complete admin panel.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Features — 9 Modules](#2-core-features--9-modules)
3. [Tech Stack & Architecture](#3-tech-stack--architecture)
4. [Database Schemas](#4-database-schemas)
5. [API Endpoints](#5-api-endpoints)
6. [Socket.io Events](#6-socketio-events)
7. [Development Phases](#7-development-phases)
8. [Folder Structure](#8-folder-structure)
9. [Environment Variables](#9-environment-variables)
10. [Getting Started](#10-getting-started)

---

## 1. Project Overview

**Project Name:** Team Communication Platform
**Type:** Full-Stack Web Application
**Category:** Real-time Communication & Collaboration Tool

### What Is This?

A Slack/Discord-style team communication platform that enables teams to collaborate through real-time messaging, organized workspaces and channels, voice/video calls, and file sharing. The platform supports multiple workspaces per user, role-based access control, threaded conversations, and a comprehensive admin panel for workspace management.

### Key Highlights

- **Real-time Everything** — Messages, typing indicators, online status, and notifications all update instantly via WebSocket connections.
- **Workspace-based Organization** — Users can create and join multiple workspaces, each with its own channels, members, and settings.
- **Rich Messaging** — Support for rich text formatting, reactions, threaded replies, @mentions, file attachments, and message search.
- **Voice & Video Calls** — Peer-to-peer voice and video calling with screen sharing using WebRTC.
- **Role-based Access Control** — Four-tier permission system: Owner, Admin, Member, and Guest.
- **Production Ready** — Dockerized, CI/CD pipeline, proper caching with Redis, and cloud deployment.

---

## 2. Core Features — 9 Modules

### Module 1: Authentication (AUTH)

The authentication system handles user identity, security, and session management.

| Feature | Description |
|---------|-------------|
| Email/Password Signup | Users register with email and password. Passwords are hashed using bcrypt before storage. |
| Email/Password Login | Authenticated via JWT (JSON Web Tokens). Returns access token + refresh token pair. |
| Google OAuth | One-click signup/login using Google account via Passport.js Google strategy. |
| Email Verification | After registration, a 6-digit OTP is sent to the user's email. Account is unverified until OTP is confirmed. |
| Forgot Password | User requests a password reset link/OTP sent to their registered email. |
| Reset Password | User sets a new password using the reset token/OTP received via email. |
| Refresh Tokens | Access tokens are short-lived (15 min). Refresh tokens (7 days) are used to obtain new access tokens without re-login. |
| Session Management | Active sessions tracked. Logout invalidates the current refresh token. |
| Profile Setup | After auth, users can set display name, upload avatar (Cloudinary/Supabase Storage), and configure preferences. |

**Auth Flow:**
```
Register → Verify Email (OTP) → Login → Access Token (15min) + Refresh Token (7d)
                                          ↓ (on expiry)
                                   Refresh Token → New Access Token
```

---

### Module 2: Workspace Management (WORKSPACE)

Workspaces are the top-level organizational unit — similar to a Slack workspace or Discord server.

| Feature | Description |
|---------|-------------|
| Create Workspace | Any authenticated user can create a workspace. Creator becomes the Owner. |
| Join via Invite Link | Workspaces generate unique invite codes/links. Anyone with the link can join (if allowed). |
| Join via Invite Code | Short alphanumeric codes that can be shared manually. |
| Role-based Access | Four roles with different permissions: **Owner** (full control), **Admin** (manage members/channels), **Member** (standard access), **Guest** (limited access). |
| Workspace Settings | Owner/Admin can update workspace name, logo, description, default channel, file upload limits, and guest access settings. |
| Member Management | Invite new members, remove existing members, and change member roles. |
| Multiple Workspaces | Users can belong to multiple workspaces and switch between them seamlessly. |
| Workspace Switcher | Sidebar UI component showing all user's workspaces with quick switching. |

**Role Permissions Matrix:**

| Action | Owner | Admin | Member | Guest |
|--------|-------|-------|--------|-------|
| Delete workspace | Yes | No | No | No |
| Edit workspace settings | Yes | Yes | No | No |
| Manage members | Yes | Yes | No | No |
| Create channels | Yes | Yes | Yes | No |
| Send messages | Yes | Yes | Yes | Yes (limited) |
| Upload files | Yes | Yes | Yes | No |
| View all channels | Yes | Yes | Public only | Public only |

---

### Module 3: Channel System (CHANNELS)

Channels organize conversations within a workspace by topic, team, or project.

| Feature | Description |
|---------|-------------|
| Public Channels | Visible to all workspace members. Anyone can join freely. |
| Private Channels | Invite-only. Only visible to members of the channel. |
| Channel Categories | Channels can be grouped under categories (e.g., "Engineering", "Marketing") for sidebar organization. |
| Channel Description | Short description explaining the channel's purpose. |
| Channel Topic | Current topic displayed at the top of the channel (can be changed frequently). |
| Pinned Messages | Important messages can be pinned to a channel. Accessible via a "Pinned" button. |
| Member List | View all members of a channel. Shows online/offline status. |
| Unread Count | Badge showing number of unread messages per channel in the sidebar. |
| Channel Search | Filter and search channels within a workspace by name. |
| Mute/Unmute | Mute a channel to stop receiving notifications from it. |

---

### Module 4: Real-time Messaging (MESSAGING)

The core feature — real-time text communication within channels and DMs.

| Feature | Description |
|---------|-------------|
| Real-time Messages | Messages appear instantly for all channel members via Socket.io WebSocket connections. |
| Rich Text Editor | TipTap-based editor supporting **bold**, *italic*, `code`, ```code blocks```, [links], lists, and quotes. |
| Message Reactions | React to any message with emojis. Multiple users can react with the same emoji (counter increments). |
| Threaded Replies | Reply to a specific message to start a thread. Threads appear in a side panel without cluttering the main chat. |
| Edit Messages | Edit your own messages after sending. Edited messages show an "(edited)" indicator. |
| Delete Messages | Delete your own messages. Admins can delete any message. Deleted messages show "[message deleted]". |
| @Mentions | Type `@` to trigger autocomplete with channel members. Mentioned users receive a notification. |
| Message Search | Full-text search across all messages in a workspace using MongoDB text indexes. |
| Typing Indicator | "User is typing..." appears in real-time when someone is composing a message. Managed via Redis for performance. |
| Read Receipts | Track which users have read each message and when. Shows delivery/read status. |
| Message Formatting | Support for code snippets (with syntax highlighting), blockquotes, ordered/unordered lists, and inline code. |
| Cursor-based Pagination | Messages load in pages of 50. Scroll up to load older messages using cursor-based pagination for performance. |

---

### Module 5: Direct Messages (DM)

Private conversations between individual users or small groups.

| Feature | Description |
|---------|-------------|
| One-on-One DMs | Private conversations between two users. Not tied to any channel. |
| Group DMs | Group conversations with up to 8 participants. |
| Full Feature Parity | DMs support all the same features as channels: reactions, threads, file sharing, typing indicators. |
| Online Status | Real-time status indicators: **Online** (green), **Offline** (gray), **Away** (yellow), **Do Not Disturb** (red). |
| Last Seen | Shows "Last seen: 2 hours ago" for offline users. |
| DM List | Sidebar section showing recent DM conversations, sorted by last message time. |

---

### Module 6: File Sharing & Media (FILES)

Upload and share files within messages and channels.

| Feature | Description |
|---------|-------------|
| File Upload | Upload images (PNG, JPG, GIF, WEBP), documents (PDF, DOCX), and videos (MP4, WEBM). |
| Image Preview | Uploaded images display as inline previews in the chat. |
| Lightbox | Click on an image to view it in a full-screen lightbox overlay. |
| File Size Limits | Free tier: 10MB per file. Premium tier: 50MB per file. |
| Drag & Drop | Drag files directly into the message input area to upload. |
| Upload Progress | Progress bar showing upload percentage for each file. |
| Storage Tracking | Per-workspace file storage usage tracking with quota management. |
| Download History | Track file download history per workspace. |
| Attachment Metadata | Each file stores: URL, original filename, file type (MIME), and file size. |

**Supported File Types:**
- **Images:** PNG, JPG, JPEG, GIF, WEBP, SVG
- **Documents:** PDF, DOCX, XLSX, PPTX, TXT
- **Videos:** MP4, WEBM
- **Other:** ZIP, RAR (download only, no preview)

---

### Module 7: Notification System (NOTIFICATIONS)

Multi-channel notification system to keep users informed without overwhelming them.

| Feature | Description |
|---------|-------------|
| In-app Notifications | Bell icon in header with unread count badge. Dropdown shows recent notifications. |
| Push Notifications | Browser push notifications using the Push API. Requires user permission. |
| Email Notifications | When a user is offline and gets @mentioned, an email notification is sent via SendGrid. |
| Per-channel Preferences | Users can customize notification settings for each channel: All messages, Mentions only, or Nothing. |
| Do Not Disturb | DND mode silences all notifications. Can be scheduled (e.g., 10 PM – 8 AM daily). |
| Desktop Notifications | Native desktop notification popups with message preview. |
| Notification Types | `mention` (someone @mentioned you), `reply` (someone replied to your thread), `invite` (workspace/channel invite), `dm` (new direct message), `system` (system announcements). |

---

### Module 8: Voice & Video Calls (VOICE/VIDEO)

Real-time audio and video communication using WebRTC peer-to-peer technology.

| Feature | Description |
|---------|-------------|
| Voice Calls | One-on-one voice calls between users within a workspace. |
| Video Calls | One-on-one video calls with camera feed. |
| Screen Sharing | Share your screen during a video call for presentations or debugging. |
| Call Controls | Mute/unmute microphone, toggle camera on/off, end call buttons. |
| Call History | Log of all past calls: who called whom, duration, timestamp. |
| Incoming Call UI | Full-screen notification with ringtone when receiving a call. Accept/Reject buttons. |
| WebRTC Signaling | NestJS gateway handles WebRTC signaling (offer/answer/ICE candidates) via Socket.io. |

**Call Flow:**
```
Caller → call:initiate → Server → call:incoming → Receiver
Receiver → call:accept → Server → Exchange WebRTC signals (offer/answer/ICE)
                                 → Peer-to-peer connection established
Either → call:end → Server → call:ended → Both parties
```

---

### Module 9: Admin Panel (ADMIN)

Workspace administration and analytics dashboard for owners and admins.

| Feature | Description |
|---------|-------------|
| Workspace Analytics | Dashboard showing: active users count, messages per day chart, most popular channels, member growth over time. |
| User Management | View all members. Actions: ban user, suspend user temporarily, change roles, remove from workspace. |
| Audit Log | Detailed log of all administrative actions: who did what and when. E.g., "Admin John removed user Jane on March 5". |
| Storage Monitoring | View total storage used by the workspace, breakdown by file type, and per-user storage usage. |
| Workspace Billing | (If premium features are enabled) Manage subscription, view usage, upgrade/downgrade plan. |

---

## 3. Tech Stack & Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Next.js 14 (App Router) + React 18             │ │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐ │ │
│  │  │  Zustand  │  │  React   │  │ Socket.io │  │  simple   │ │ │
│  │  │  (State)  │  │  Query   │  │  Client   │  │   peer    │ │ │
│  │  └──────────┘  └──────────┘  └───────────┘  └───────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────┬───────────────────────┘
                          │ REST API      │ WebSocket
                          │ (HTTP/HTTPS)  │ (WSS)
┌─────────────────────────▼───────────────▼───────────────────────┐
│                        SERVER (NestJS)                           │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │   Auth   │  │   REST   │  │  Socket.io│  │   WebRTC      │  │
│  │ Passport │  │  Controllers│ │  Gateway  │  │  Signaling    │  │
│  │  + JWT   │  │  + Services │ │  (Chat)   │  │  Gateway      │  │
│  └──────────┘  └──────────┘  └───────────┘  └───────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │Throttler │  │ Swagger  │  │ Cloudinary│  │  Nodemailer   │  │
│  │  (Rate)  │  │(API Docs)│  │ (Upload)  │  │  + SendGrid   │  │
│  └──────────┘  └──────────┘  └───────────┘  └───────────────┘  │
└────────────┬────────────────────────┬───────────────────────────┘
             │                        │
     ┌───────▼───────┐       ┌───────▼───────┐
     │   MongoDB     │       │    Redis      │
     │   (Primary)   │       │   (Cache)     │
     │               │       │               │
     │ • Users       │       │ • Sessions    │
     │ • Workspaces  │       │ • Online      │
     │ • Channels    │       │   Status      │
     │ • Messages    │       │ • Typing      │
     │ • Notifs      │       │   Indicators  │
     └───────────────┘       └───────────────┘
```

### Frontend — Next.js 14

| Technology | Purpose |
|-----------|---------|
| **Next.js 14 (App Router)** | React framework with server-side rendering, file-based routing, and API routes. |
| **React 18** | UI library with hooks, Suspense, and concurrent features. |
| **TypeScript** | Type-safe JavaScript for better developer experience and fewer runtime errors. |
| **Tailwind CSS** | Utility-first CSS framework for rapid, responsive UI development. |
| **shadcn/ui** | Pre-built, accessible UI components built on Radix UI primitives. |
| **Zustand** | Lightweight global state management for auth state, active workspace, and UI state. |
| **React Query (TanStack Query)** | Server state management with automatic caching, refetching, and optimistic updates. |
| **Socket.io-client** | WebSocket client for real-time bidirectional communication with the server. |
| **TipTap** | Headless rich text editor framework for the message composer (bold, italic, code, links, etc.). |
| **simple-peer** | WebRTC wrapper library for peer-to-peer voice and video calls. |
| **React Hook Form** | Performant form handling with minimal re-renders. |
| **Zod** | Schema-based validation library. Used with React Hook Form for form validation. |
| **react-dropzone** | Drag-and-drop file upload component with progress tracking. |
| **react-hot-toast** | Toast notification library for success/error feedback. |
| **Browser Push API** | Native browser push notifications for mentions and DMs. |

### Backend — NestJS

| Technology | Purpose |
|-----------|---------|
| **NestJS** | Progressive Node.js framework with modular architecture, dependency injection, and TypeScript support. |
| **TypeScript** | End-to-end type safety matching the frontend. |
| **Passport.js** | Authentication middleware. Strategies: JWT (for API auth) + Google OAuth (for social login). |
| **@nestjs/websockets** | WebSocket module with Socket.io adapter for real-time features. |
| **Cloudinary SDK** | Cloud-based image and file storage with automatic optimization and transformations. |
| **Supabase Storage** | Alternative file storage option with S3-compatible API. |
| **Nodemailer + SendGrid** | Email sending service for verification OTPs, password resets, and notification emails. |
| **class-validator** | Decorator-based DTO validation for request body/params/query validation. |
| **class-transformer** | Transform plain objects to class instances and vice versa. Used with class-validator. |
| **Swagger / OpenAPI** | Auto-generated API documentation from controller decorators. Available at `/api/docs`. |
| **@nestjs/throttler** | Rate limiting to prevent API abuse. Configurable per-route limits. |
| **Redis (@nestjs/cache-manager)** | Caching layer for frequently accessed data, session storage, and real-time state. |

### Database Layer

| Technology | Purpose | Why? |
|-----------|---------|------|
| **MongoDB (Mongoose ODM)** | Primary database for all persistent data | Messages are document-shaped. Flexible schema handles reactions, threads, and attachments naturally. Excellent for real-time chat workloads. |
| **Redis** | Cache, sessions, and real-time state | In-memory data store for ultra-fast reads. Stores online status, typing indicators, and session tokens. |

**MongoDB Indexing Strategy:**
- `messages`: Compound index on `(channelId, createdAt)` for fast message loading per channel.
- `messages`: Text index on `content` for full-text search.
- `users`: Unique index on `email` for login lookups.
- `workspaces`: Unique index on `slug` for URL routing.
- `workspaces`: Unique index on `inviteCode` for invite lookups.

### DevOps & Deployment

| Technology | Purpose |
|-----------|---------|
| **Docker + docker-compose** | Containerized development and production environments. Services: frontend, backend, MongoDB, Redis. |
| **Vercel** | Frontend deployment with automatic GitHub integration, preview deployments, and edge network. |
| **Railway / Render** | Backend deployment with WebSocket support, auto-scaling, and environment variable management. |
| **MongoDB Atlas** | Managed MongoDB hosting. Free tier (512MB) to start, scalable to production clusters. |
| **GitHub Actions** | CI/CD pipeline: lint → test → build → deploy on every push to main. |
| **NestJS Health Checks** | Built-in health check endpoints for monitoring database and Redis connectivity. |

---

## 4. Database Schemas

### 4.1 User Schema

Stores user identity, authentication data, preferences, and online status.

```javascript
User {
  _id:              ObjectId,                          // MongoDB auto-generated unique ID
  email:            String (unique, indexed),           // User's email address — used for login
  password:         String,                             // Bcrypt hashed password (null for Google OAuth users)
  displayName:      String,                             // User's display name shown in chat
  avatar:           String,                             // URL to avatar image (Cloudinary/Supabase)
  status:           "online" | "offline" | "away" | "dnd",  // Current presence status
  customStatus:     String,                             // Custom status message (e.g., "In a meeting")
  lastSeen:         Date,                               // Timestamp of last activity (for "Last seen" display)
  emailVerified:    Boolean,                            // Whether email has been verified via OTP
  googleId:         String (nullable),                  // Google OAuth ID (null for email/password users)
  preferences: {
    notifications: {
      email:        Boolean,                            // Receive email notifications
      push:         Boolean,                            // Receive push notifications
      sound:        Boolean                             // Play notification sounds
    },
    theme:          "light" | "dark" | "system",        // UI theme preference
    dndSchedule: {
      enabled:      Boolean,                            // Whether DND schedule is active
      start:        String,                             // DND start time (e.g., "22:00")
      end:          String                              // DND end time (e.g., "08:00")
    }
  },
  createdAt:        Date,                               // Account creation timestamp
  updatedAt:        Date                                // Last profile update timestamp
}
```

### 4.2 Workspace Schema

Represents a team workspace containing members, channels, and settings.

```javascript
Workspace {
  _id:              ObjectId,                           // Unique workspace ID
  name:             String,                             // Workspace display name
  slug:             String (unique),                    // URL-friendly identifier (e.g., "my-team")
  description:      String,                             // Short description of the workspace
  logo:             String,                             // URL to workspace logo image
  owner:            ObjectId (ref: User),               // User who created the workspace
  members: [{                                           // Array of workspace members
    user:           ObjectId (ref: User),               // Reference to user document
    role:           "owner" | "admin" | "member" | "guest",  // Member's role in this workspace
    joinedAt:       Date                                // When the member joined
  }],
  inviteCode:       String (unique),                    // Unique invite code (can be regenerated)
  settings: {
    defaultChannel: ObjectId,                           // Channel users land on when opening workspace
    fileUploadLimit: Number,                            // Max file size in bytes
    allowGuests:    Boolean                             // Whether guest access is enabled
  },
  createdAt:        Date                                // Workspace creation timestamp
}
```

### 4.3 Channel Schema

Represents a conversation space within a workspace — public, private, or DM.

```javascript
Channel {
  _id:              ObjectId,                           // Unique channel ID
  workspace:        ObjectId (ref: Workspace),          // Parent workspace
  name:             String,                             // Channel name (e.g., "general", "engineering")
  description:      String,                             // What this channel is about
  topic:            String,                             // Current channel topic (shown at top)
  type:             "public" | "private" | "dm",        // Channel visibility type
  category:         String,                             // Category for sidebar grouping (e.g., "Engineering")
  members:          [ObjectId] (ref: User),             // Array of member user IDs
  pinnedMessages:   [ObjectId] (ref: Message),          // Array of pinned message IDs
  createdBy:        ObjectId (ref: User),               // User who created the channel
  createdAt:        Date                                // Channel creation timestamp
}
```

### 4.4 Message Schema

Stores all messages with support for rich content, reactions, threads, and read tracking.

```javascript
Message {
  _id:              ObjectId,                           // Unique message ID
  channel:          ObjectId (ref: Channel),            // Channel this message belongs to
  sender:           ObjectId (ref: User),               // User who sent the message
  content:          String,                             // Message text (rich text / markdown)
  type:             "text" | "image" | "file" | "system",  // Message type
  attachments: [{                                       // File attachments array
    url:            String,                             // File URL (Cloudinary/Supabase)
    filename:       String,                             // Original file name
    fileType:       String,                             // MIME type (e.g., "image/png")
    size:           Number                              // File size in bytes
  }],
  reactions: [{                                         // Emoji reactions array
    emoji:          String,                             // Emoji character (e.g., "👍")
    users:          [ObjectId]                          // Users who reacted with this emoji
  }],
  thread: {                                             // Thread/reply information
    parentMessage:  ObjectId (nullable),                // Parent message ID (null if not a reply)
    replyCount:     Number,                             // Number of replies in this thread
    lastReplyAt:    Date                                // Timestamp of most recent reply
  },
  mentions:         [ObjectId] (ref: User),             // Users mentioned in this message
  edited:           Boolean,                            // Whether message has been edited
  editedAt:         Date,                               // When the message was last edited
  deleted:          Boolean,                            // Soft delete flag
  readBy: [{                                            // Read receipt tracking
    user:           ObjectId,                           // User who read the message
    readAt:         Date                                // When they read it
  }],
  createdAt:        Date                                // Message creation timestamp
}
```

### 4.5 Notification Schema

Stores user notifications with references to related workspace, channel, and message.

```javascript
Notification {
  _id:              ObjectId,                           // Unique notification ID
  recipient:        ObjectId (ref: User),               // User who receives this notification
  type:             "mention" | "reply" | "invite" | "dm" | "system",  // Notification category
  title:            String,                             // Short notification title
  body:             String,                             // Notification body text
  data: {                                               // Related entity references
    workspace:      ObjectId,                           // Related workspace
    channel:        ObjectId,                           // Related channel
    message:        ObjectId                            // Related message (if applicable)
  },
  read:             Boolean,                            // Whether user has read this notification
  createdAt:        Date                                // Notification creation timestamp
}
```

### Entity Relationships

```
User ──────┬──── belongs to many ────── Workspace (via members array)
           │
           ├──── belongs to many ────── Channel (via members array)
           │
           ├──── sends many ─────────── Message
           │
           └──── receives many ──────── Notification

Workspace ─┬──── has many ─────────── Channel
            │
            └──── has many ─────────── Members (User refs with roles)

Channel ───┬──── has many ─────────── Message
            │
            └──── has many ─────────── Pinned Messages (Message refs)

Message ───┬──── has many ─────────── Reactions (embedded)
            │
            ├──── has many ─────────── Attachments (embedded)
            │
            ├──── has many ─────────── Read Receipts (embedded)
            │
            └──── can have ─────────── Thread (self-referencing via parentMessage)
```

---

## 5. API Endpoints

### 5.1 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register new user with email and password | No |
| `POST` | `/auth/login` | Login with email and password. Returns JWT access + refresh tokens | No |
| `POST` | `/auth/google` | Authenticate via Google OAuth. Creates account if first time | No |
| `POST` | `/auth/verify-email` | Verify email with 6-digit OTP code | No |
| `POST` | `/auth/forgot-password` | Request password reset email with OTP/link | No |
| `POST` | `/auth/reset-password` | Reset password using token from email | No |
| `POST` | `/auth/refresh-token` | Exchange refresh token for new access token | No (uses refresh token) |
| `POST` | `/auth/logout` | Invalidate current refresh token and end session | Yes |

### 5.2 Workspace Endpoints

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `POST` | `/workspaces` | Create a new workspace | Yes | Any authenticated user |
| `GET` | `/workspaces` | Get all workspaces the current user belongs to | Yes | Any member |
| `GET` | `/workspaces/:id` | Get workspace details by ID | Yes | Workspace member |
| `PATCH` | `/workspaces/:id` | Update workspace settings (name, logo, description) | Yes | Owner, Admin |
| `DELETE` | `/workspaces/:id` | Delete a workspace permanently | Yes | Owner only |
| `POST` | `/workspaces/:id/invite` | Generate or regenerate invite link/code | Yes | Owner, Admin |
| `POST` | `/workspaces/join/:inviteCode` | Join a workspace using invite code | Yes | Any authenticated user |
| `PATCH` | `/workspaces/:id/members/:userId/role` | Change a member's role | Yes | Owner, Admin |
| `DELETE` | `/workspaces/:id/members/:userId` | Remove a member from workspace | Yes | Owner, Admin |

### 5.3 Channel Endpoints

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `POST` | `/channels` | Create a new channel in a workspace | Yes | Owner, Admin, Member |
| `GET` | `/channels?workspaceId=...` | Get all channels in a workspace (filtered by user access) | Yes | Workspace member |
| `GET` | `/channels/:id` | Get channel details | Yes | Channel member |
| `PATCH` | `/channels/:id` | Update channel (name, description, topic, category) | Yes | Channel creator, Admin |
| `DELETE` | `/channels/:id` | Delete a channel | Yes | Owner, Admin |
| `POST` | `/channels/:id/join` | Join a public channel | Yes | Workspace member |
| `POST` | `/channels/:id/leave` | Leave a channel | Yes | Channel member |
| `GET` | `/channels/:id/members` | Get list of channel members | Yes | Channel member |
| `POST` | `/channels/:id/pin/:messageId` | Pin/unpin a message in the channel | Yes | Owner, Admin, Member |

### 5.4 Message Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/messages?channelId=...&cursor=...&limit=50` | Get messages for a channel with cursor-based pagination | Yes |
| `POST` | `/messages` | Send a new message to a channel | Yes |
| `PATCH` | `/messages/:id` | Edit a message (sender only) | Yes |
| `DELETE` | `/messages/:id` | Delete a message (sender or Admin) | Yes |
| `POST` | `/messages/:id/reactions` | Add a reaction to a message | Yes |
| `DELETE` | `/messages/:id/reactions/:emoji` | Remove your reaction from a message | Yes |
| `GET` | `/messages/:id/thread` | Get all replies in a message thread | Yes |
| `GET` | `/messages/search?q=...&workspaceId=...` | Search messages by text content within a workspace | Yes |

### 5.5 User & Upload Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/users/me` | Get current user's profile | Yes |
| `PATCH` | `/users/me` | Update profile (displayName, avatar, preferences) | Yes |
| `POST` | `/upload` | Upload a file (multipart/form-data). Returns file URL and metadata | Yes |

### 5.6 Notification Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/notifications?limit=20&cursor=...` | Get user's notifications with cursor-based pagination | Yes |
| `PATCH` | `/notifications/:id/read` | Mark a single notification as read | Yes |
| `PATCH` | `/notifications/read-all` | Mark all notifications as read | Yes |

---

## 6. Socket.io Events

### Client → Server (Emit)

| Event | Payload | Description |
|-------|---------|-------------|
| `message:send` | `{ channelId, content, attachments?, parentMessageId? }` | Send a new message or thread reply |
| `message:edit` | `{ messageId, content }` | Edit an existing message |
| `message:delete` | `{ messageId }` | Delete a message |
| `typing:start` | `{ channelId }` | Notify that current user started typing |
| `typing:stop` | `{ channelId }` | Notify that current user stopped typing |
| `channel:join` | `{ channelId }` | Join a channel's socket room to receive its messages |
| `channel:leave` | `{ channelId }` | Leave a channel's socket room |
| `call:initiate` | `{ targetUserId, type: "voice" \| "video" }` | Start a call with another user |
| `call:accept` | `{ callId }` | Accept an incoming call |
| `call:reject` | `{ callId }` | Reject an incoming call |
| `call:end` | `{ callId }` | End an active call |

### Server → Client (Listen)

| Event | Payload | Description |
|-------|---------|-------------|
| `message:new` | `{ message }` | A new message was sent in a joined channel |
| `message:updated` | `{ message }` | A message was edited |
| `message:deleted` | `{ messageId, channelId }` | A message was deleted |
| `user:typing` | `{ userId, channelId, displayName }` | A user is typing in a channel |
| `user:status-change` | `{ userId, status }` | A user's online status changed |
| `notification:new` | `{ notification }` | A new notification for the current user |
| `call:incoming` | `{ callId, callerId, callerName, type }` | Incoming call notification |
| `call:signal` | `{ signal }` | WebRTC signaling data (offer/answer/ICE candidates) |

---

## 7. Development Phases

### Phase 1 — Foundation (Week 1–2)

**Goal:** Set up the project infrastructure and implement the complete authentication system.

**Tasks:**
- [ ] Initialize Next.js 14 project with TypeScript, Tailwind CSS, and shadcn/ui
- [ ] Initialize NestJS project with TypeScript and modular structure
- [ ] Set up Docker Compose with MongoDB and Redis containers
- [ ] Implement User schema with Mongoose
- [ ] Build auth system: register, login, JWT tokens, refresh tokens
- [ ] Integrate Google OAuth via Passport.js
- [ ] Implement email verification with OTP (Nodemailer + SendGrid)
- [ ] Implement forgot/reset password flow
- [ ] Build user profile CRUD with avatar upload (Cloudinary)
- [ ] Create basic UI layout: sidebar shell, header, main content area
- [ ] Build auth pages: login, register, verify email
- [ ] Set up Zustand auth store and axios interceptor for JWT
- [ ] Configure Swagger API documentation

**Deliverables:** Working auth system, basic UI shell, Dockerized development environment.

---

### Phase 2 — Workspaces & Channels (Week 3–4)

**Goal:** Build the workspace and channel management system with full RBAC.

**Tasks:**
- [ ] Implement Workspace schema and CRUD endpoints
- [ ] Build invite system (generate code, join via code/link)
- [ ] Implement role-based access control (Owner, Admin, Member, Guest)
- [ ] Build member management: invite, remove, change roles
- [ ] Implement Channel schema and CRUD endpoints
- [ ] Build public and private channel support
- [ ] Implement channel categories for sidebar organization
- [ ] Build channel member management (join, leave, member list)
- [ ] Create workspace switcher UI component
- [ ] Build sidebar with channel list (grouped by category)
- [ ] Create workspace settings page
- [ ] Build channel settings and member management UI
- [ ] Implement multi-workspace support with workspace switching

**Deliverables:** Complete workspace and channel system with UI, role management, and invite flow.

---

### Phase 3 — Real-time Messaging (Week 5–7)

**Goal:** Implement the core messaging experience with real-time features.

**Tasks:**
- [ ] Set up Socket.io on NestJS (chat gateway)
- [ ] Implement real-time message sending and receiving
- [ ] Build message CRUD endpoints with cursor-based pagination
- [ ] Integrate TipTap rich text editor for message composition
- [ ] Implement typing indicators via Socket.io + Redis
- [ ] Build online/offline status tracking via Redis
- [ ] Implement emoji reactions on messages
- [ ] Build threaded replies with thread panel UI
- [ ] Implement @mentions with autocomplete dropdown
- [ ] Build message search using MongoDB text indexes
- [ ] Implement message edit and delete with real-time updates
- [ ] Build file upload in messages (drag-and-drop + click)
- [ ] Implement image preview and lightbox
- [ ] Build direct messages (1-on-1 conversations)
- [ ] Implement group DMs (up to 8 participants)
- [ ] Build DM list in sidebar with last message preview
- [ ] Implement read receipts and delivery status

**Deliverables:** Full real-time messaging with rich text, reactions, threads, mentions, file sharing, and DMs.

---

### Phase 4 — Notifications & Polish (Week 8–9)

**Goal:** Build the notification system and polish the user experience.

**Tasks:**
- [ ] Implement Notification schema and CRUD endpoints
- [ ] Build in-app notification bell with unread count badge
- [ ] Implement notification dropdown with recent notifications
- [ ] Set up browser push notifications (Push API + Service Worker)
- [ ] Implement email notifications for offline @mentions
- [ ] Build per-channel notification preferences
- [ ] Implement unread message counts per channel in sidebar
- [ ] Build Do Not Disturb mode with scheduled hours
- [ ] Implement desktop notification support
- [ ] Polish UI animations and transitions
- [ ] Add loading states and skeleton screens
- [ ] Implement error boundaries and error handling

**Deliverables:** Complete notification system (in-app, push, email) with user preferences and polished UI.

---

### Phase 5 — Voice/Video & Admin (Week 10–12)

**Goal:** Add voice/video calling, admin features, and prepare for production deployment.

**Tasks:**
- [ ] Set up WebRTC signaling gateway on NestJS
- [ ] Implement one-on-one voice calls using simple-peer
- [ ] Implement one-on-one video calls
- [ ] Build screen sharing functionality
- [ ] Create call UI: controls, incoming call notification, call history
- [ ] Build admin panel layout and navigation
- [ ] Implement workspace analytics dashboard (active users, messages/day, popular channels)
- [ ] Build user management UI (ban, suspend, role changes)
- [ ] Implement audit log system
- [ ] Build storage monitoring dashboard
- [ ] Implement responsive design for mobile/tablet
- [ ] Build dark mode with theme toggle
- [ ] Create Docker production configuration
- [ ] Set up GitHub Actions CI/CD pipeline (lint, test, build, deploy)
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway/Render
- [ ] Set up MongoDB Atlas production cluster
- [ ] Write comprehensive README with screenshots and setup instructions

**Deliverables:** Voice/video calls, admin panel, responsive design, dark mode, production deployment, and documentation.

---

## 8. Folder Structure

```
team-chat/
├── client/                              # Next.js 14 frontend application
│   ├── app/                             # App Router pages and layouts
│   │   ├── (auth)/                      # Auth route group (no layout nesting)
│   │   │   ├── login/page.tsx           # Login page
│   │   │   ├── register/page.tsx        # Registration page
│   │   │   └── verify-email/page.tsx    # Email OTP verification page
│   │   ├── (main)/                      # Main app route group (requires auth)
│   │   │   ├── workspace/[workspaceId]/ # Dynamic workspace routes
│   │   │   │   ├── channel/[channelId]/page.tsx   # Channel messaging view
│   │   │   │   ├── dm/[conversationId]/page.tsx   # Direct message view
│   │   │   │   └── settings/page.tsx              # Workspace settings
│   │   │   └── layout.tsx               # Main layout (sidebar + header + content)
│   │   ├── layout.tsx                   # Root layout (providers, global styles)
│   │   └── page.tsx                     # Landing/redirect page
│   │
│   ├── components/                      # Reusable React components
│   │   ├── chat/                        # Messaging components
│   │   │   ├── MessageList.tsx          # Scrollable message list with pagination
│   │   │   ├── MessageItem.tsx          # Individual message bubble
│   │   │   ├── MessageInput.tsx         # TipTap rich text input + send button
│   │   │   ├── ThreadPanel.tsx          # Side panel for threaded replies
│   │   │   ├── ReactionPicker.tsx       # Emoji picker for reactions
│   │   │   └── TypingIndicator.tsx      # "User is typing..." display
│   │   ├── sidebar/                     # Sidebar navigation components
│   │   │   ├── Sidebar.tsx              # Main sidebar container
│   │   │   ├── WorkspaceSwitcher.tsx    # Workspace icon bar for switching
│   │   │   ├── ChannelList.tsx          # Channel list grouped by category
│   │   │   └── DirectMessageList.tsx    # DM conversations list
│   │   ├── workspace/                   # Workspace management components
│   │   │   ├── CreateWorkspace.tsx      # Create workspace modal/form
│   │   │   ├── InviteModal.tsx          # Invite link/code sharing modal
│   │   │   └── MemberList.tsx           # Workspace member list with role badges
│   │   ├── calls/                       # Voice/Video call components
│   │   │   ├── VideoCall.tsx            # Video call UI with peer video streams
│   │   │   ├── VoiceCall.tsx            # Voice call UI with controls
│   │   │   └── CallNotification.tsx     # Incoming call popup
│   │   └── ui/                          # shadcn/ui component library
│   │
│   ├── hooks/                           # Custom React hooks
│   │   ├── useSocket.ts                 # Socket.io connection and event management
│   │   ├── useMessages.ts              # Message fetching, sending, and caching
│   │   ├── useTyping.ts                # Typing indicator logic
│   │   └── useWebRTC.ts                # WebRTC peer connection management
│   │
│   ├── lib/                             # Utility libraries and configurations
│   │   ├── api.ts                       # Axios instance with JWT interceptor
│   │   ├── socket.ts                    # Socket.io client singleton
│   │   └── utils.ts                     # Helper functions (formatting, etc.)
│   │
│   ├── store/                           # Zustand global state stores
│   │   ├── authStore.ts                 # Auth state: user, tokens, login/logout
│   │   ├── workspaceStore.ts            # Active workspace, workspaces list
│   │   └── chatStore.ts                 # Active channel, messages cache, typing state
│   │
│   └── types/                           # TypeScript type definitions
│       └── index.ts                     # Shared types: User, Workspace, Channel, Message, etc.
│
├── server/                              # NestJS backend application
│   ├── src/
│   │   ├── auth/                        # Authentication module
│   │   │   ├── auth.module.ts           # Module definition with imports/providers
│   │   │   ├── auth.controller.ts       # Auth REST endpoints
│   │   │   ├── auth.service.ts          # Auth business logic (hash, verify, tokens)
│   │   │   ├── jwt.strategy.ts          # Passport JWT strategy for token validation
│   │   │   ├── google.strategy.ts       # Passport Google OAuth strategy
│   │   │   └── guards/                  # Auth guards (JwtAuthGuard, RolesGuard)
│   │   │
│   │   ├── users/                       # Users module
│   │   │   ├── users.module.ts          # Module definition
│   │   │   ├── users.controller.ts      # User profile endpoints
│   │   │   ├── users.service.ts         # User CRUD logic
│   │   │   └── schemas/user.schema.ts   # Mongoose User schema definition
│   │   │
│   │   ├── workspaces/                  # Workspaces module
│   │   │   ├── workspaces.module.ts     # Module definition
│   │   │   ├── workspaces.controller.ts # Workspace REST endpoints
│   │   │   ├── workspaces.service.ts    # Workspace business logic
│   │   │   └── schemas/workspace.schema.ts  # Mongoose Workspace schema
│   │   │
│   │   ├── channels/                    # Channels module
│   │   │   ├── channels.module.ts       # Module definition
│   │   │   ├── channels.controller.ts   # Channel REST endpoints
│   │   │   ├── channels.service.ts      # Channel business logic
│   │   │   └── schemas/channel.schema.ts    # Mongoose Channel schema
│   │   │
│   │   ├── messages/                    # Messages module
│   │   │   ├── messages.module.ts       # Module definition
│   │   │   ├── messages.controller.ts   # Message REST endpoints
│   │   │   ├── messages.service.ts      # Message business logic
│   │   │   └── schemas/message.schema.ts    # Mongoose Message schema
│   │   │
│   │   ├── notifications/              # Notifications module
│   │   │   ├── notifications.module.ts  # Module definition
│   │   │   ├── notifications.controller.ts  # Notification REST endpoints
│   │   │   └── notifications.service.ts     # Notification business logic
│   │   │
│   │   ├── gateway/                     # WebSocket gateways
│   │   │   ├── chat.gateway.ts          # Socket.io handler for messaging events
│   │   │   └── call.gateway.ts          # WebRTC signaling for voice/video calls
│   │   │
│   │   ├── upload/                      # File upload module
│   │   │   ├── upload.module.ts         # Module definition
│   │   │   └── upload.service.ts        # Cloudinary/Supabase upload logic
│   │   │
│   │   ├── common/                      # Shared utilities and cross-cutting concerns
│   │   │   ├── decorators/              # Custom decorators (e.g., @CurrentUser)
│   │   │   ├── filters/                 # Exception filters (e.g., HttpExceptionFilter)
│   │   │   ├── guards/                  # Shared guards (e.g., RolesGuard, WsAuthGuard)
│   │   │   └── interceptors/            # Interceptors (e.g., TransformInterceptor)
│   │   │
│   │   ├── app.module.ts               # Root module — imports all feature modules
│   │   └── main.ts                      # Application entry point — bootstrap NestJS
│   │
│   └── test/                            # Backend test files
│
├── docker-compose.yml                   # Development Docker setup (frontend + backend + mongo + redis)
├── docker-compose.prod.yml              # Production Docker setup with optimized configs
├── .github/
│   └── workflows/
│       ├── ci.yml                       # CI pipeline: lint → test → build
│       └── deploy.yml                   # CD pipeline: deploy to Vercel + Railway
└── README.md                            # Project documentation with setup instructions
```

---

## 9. Environment Variables

### Client (`client/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### Server (`server/.env`)

```env
# App
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/team-chat
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@yourapp.com

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

---

## 10. Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn** or **pnpm**
- **Docker** and **Docker Compose**
- **Git**

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/team-chat.git
cd team-chat

# 2. Start MongoDB and Redis via Docker
docker-compose up -d mongo redis

# 3. Set up the backend
cd server
cp .env.example .env          # Configure your environment variables
npm install
npm run start:dev             # Starts NestJS on http://localhost:3001

# 4. Set up the frontend (in a new terminal)
cd client
cp .env.example .env.local    # Configure your environment variables
npm install
npm run dev                   # Starts Next.js on http://localhost:3000

# 5. Open http://localhost:3000 in your browser
```

### Docker (Full Stack)

```bash
# Start everything with Docker Compose
docker-compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
# API Docs: http://localhost:3001/api/docs
# MongoDB:  localhost:27017
# Redis:    localhost:6379
```

---

> **This document serves as the single source of truth for the Team Communication Platform project. All implementation decisions, architectural choices, and feature specifications are defined here. Refer to this document when building any part of the system.**

---

## 11. Development Approach — Teaching Mode

> **IMPORTANT FOR AI ASSISTANTS (Claude or any LLM reading this document):**
>
> This project is being built with a **learning-first approach**. The developer (Abdullah) wants to deeply understand every technical concept, decision, and piece of code written during development. Follow these rules strictly:

### Rules for Every Step

1. **Explain Before Writing Code**
   - Before writing any file or code block, explain **what** you are about to create, **why** it is needed, and **how** it works technically.
   - Example: Before creating `jwt.strategy.ts`, explain what a Passport strategy is, how JWT validation works, what the `validate()` method does, and why we need it.

2. **Step-by-Step Execution**
   - Do NOT rush through multiple files at once. Work on **one concept at a time**.
   - After each step, pause and make sure the developer understands before moving to the next.

3. **Technical Knowledge With Every Action**
   - Every action (installing a package, creating a file, writing a function) must come with a clear technical explanation.
   - Cover: What is this? Why are we using it? How does it work internally? What are the alternatives?

4. **Real-World Context**
   - Relate concepts to how they work in production applications (Slack, Discord, etc.).
   - Example: "JWT refresh tokens work the same way Slack keeps you logged in for days without re-entering your password."

5. **No Black Boxes**
   - Nothing should feel like magic. Every line of code should be understood.
   - If a decorator like `@UseGuards()` is used, explain what decorators are, what guards are, and how NestJS processes them.

6. **Progressive Complexity**
   - Start simple, then layer complexity. Don't introduce advanced patterns before the basics are clear.
   - Example: First make a simple login work → then add JWT → then add refresh tokens → then add Google OAuth.

7. **Ask Before Proceeding**
   - After explaining a concept and writing the code, ask the developer if they understood or have questions before moving forward.

8. **Summarize After Each Module**
   - After completing a module (e.g., Auth), provide a summary of:
     - What was built
     - What technologies were used and why
     - How the pieces connect together
     - Key concepts learned

### What the Developer Wants to Learn

- **Backend Architecture:** NestJS modules, dependency injection, decorators, guards, interceptors, pipes
- **Authentication:** JWT mechanics, OAuth flows, session management, bcrypt hashing, token rotation
- **Database Design:** MongoDB schema design, Mongoose ODM, indexing strategies, relationships in NoSQL
- **Real-time Systems:** WebSocket architecture, Socket.io rooms/namespaces, event-driven programming
- **State Management:** Zustand store patterns, React Query caching strategies, optimistic updates
- **WebRTC:** Peer-to-peer connections, signaling servers, ICE candidates, STUN/TURN servers
- **DevOps:** Docker containerization, CI/CD pipelines, environment management, deployment strategies
- **TypeScript:** Generics, utility types, type guards, discriminated unions, module augmentation

### End Goal

By the time this project is complete, the developer should have **deep technical knowledge** of every technology, pattern, and architectural decision used — not just a working codebase, but a thorough understanding of **why everything works the way it does**.
