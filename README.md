# TeamChat — Real-time Team Communication Platform

A production-grade Slack/Discord-style team communication platform built with Next.js 14, NestJS, MongoDB, Redis, Socket.io, and WebRTC.

## Features

- Real-time messaging with Socket.io
- Workspace and channel management with role-based access control
- Threaded conversations and message reactions
- @mentions with notifications
- Voice and video calls via WebRTC
- File and avatar uploads via Cloudinary
- Email verification with OTP
- Google OAuth login
- Admin dashboard with analytics
- Rate limiting and security headers

## Tech Stack

**Frontend:** Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Socket.io-client, simple-peer

**Backend:** NestJS 11, MongoDB (Mongoose), Redis, Socket.io, Passport.js (JWT + Google OAuth), Cloudinary, Nodemailer

**Infrastructure:** Docker, docker-compose, Helmet, Throttler

## Project Structure

```
.
├── client/                  Next.js frontend
├── server/                  NestJS backend
├── docker-compose.yml       Development services (MongoDB + Redis)
├── docker-compose.prod.yml  Full production stack
└── PROJECT_DETAILS.md       Detailed feature documentation
```

## Local Development

### Prerequisites

- Node.js 20+
- Docker Desktop
- npm

### Setup

1. Clone the repository
2. Start MongoDB and Redis:
   ```bash
   docker-compose up -d
   ```
3. Configure backend environment:
   ```bash
   cd server
   cp .env.example .env
   ```
   Edit `.env` and set values for:
   - `JWT_SECRET` and `JWT_REFRESH_SECRET` (any secure random strings for dev)
   - `EMAIL_*` (Gmail SMTP credentials with App Password)
   - `CLOUDINARY_*` (free account at cloudinary.com)
   - `GOOGLE_*` (optional, for Google OAuth)

4. Configure frontend environment:
   ```bash
   cd ../client
   cp .env.example .env.local
   ```

5. Install dependencies and start:
   ```bash
   cd ../server && npm install && npm run start:dev
   cd ../client && npm install && npm run dev
   ```

6. Open `http://localhost:3000` in your browser.

## Production Deployment

### Option 1: Docker Compose (Recommended)

1. Create a `.env` file at the project root with production values:

   ```env
   JWT_SECRET=<generate-with-openssl-rand-base64-48>
   JWT_REFRESH_SECRET=<different-secure-random-string>
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   CLIENT_URL=https://yourdomain.com
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email
   EMAIL_PASS=your_app_password
   EMAIL_FROM=noreply@yourdomain.com

   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
   NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
   ```

2. Build and start:

   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. Frontend runs on port 3000, backend on 3001.

### Option 2: Vercel + Railway

**Frontend (Vercel):**
1. Push project to GitHub
2. Import repository in Vercel, set root to `client`
3. Add environment variables (`NEXT_PUBLIC_*`)
4. Deploy

**Backend (Railway/Render):**
1. Create new service from `server` directory
2. Set start command: `npm run start:prod`
3. Add all backend environment variables
4. Connect MongoDB Atlas and Redis Cloud
5. Deploy

### Generate Secure JWT Secrets

```bash
openssl rand -base64 48
```

## Health Check

The backend exposes a health endpoint:

```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-08T12:00:00.000Z",
  "uptime": 123.45,
  "database": "connected"
}
```

## API Documentation

See [PROJECT_DETAILS.md](PROJECT_DETAILS.md) for the complete API reference, database schemas, and architecture overview.

## Security Features

- Helmet.js for HTTP security headers
- Global rate limiting (100 requests per minute per IP)
- JWT-based authentication with refresh tokens
- bcrypt password hashing
- CORS with whitelisted origins
- Email verification required for login
- Role-based access control on workspaces

## License

MIT
