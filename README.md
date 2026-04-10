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

### Option 2: Vercel + Railway (Recommended for Beginners)

This is the easiest way to deploy without managing servers. Frontend goes to Vercel, backend to Railway, and MongoDB to MongoDB Atlas (free tier).

#### Step 1 — Set up MongoDB Atlas (Free)

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account
2. Create a new free cluster (M0 tier, any region)
3. **Database Access** → Add a new database user with username and password
4. **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere — required for Railway)
5. **Connect** → "Drivers" → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/team-chat?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password and add `/team-chat` before the `?` if missing

#### Step 2 — Deploy Backend to Railway

1. Push your code to GitHub
2. Go to https://railway.app and sign in with GitHub
3. **New Project** → **Deploy from GitHub repo** → select your repository
4. Railway will detect the monorepo. Click **Add variables** → set **Root Directory** to `server`
5. Railway will auto-detect Node.js and run `npm install` + `npm run build` + `npm run start:prod`
6. Go to **Variables** tab and add ALL of these:

   ```
   NODE_ENV=production
   MONGODB_URI=<your MongoDB Atlas connection string from Step 1>
   JWT_SECRET=<run: openssl rand -base64 48>
   JWT_REFRESH_SECRET=<run: openssl rand -base64 48 (different value)>
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   CLIENT_URL=https://placeholder.vercel.app
   ALLOWED_ORIGINS=https://placeholder.vercel.app
   CLOUDINARY_CLOUD_NAME=<from cloudinary.com dashboard>
   CLOUDINARY_API_KEY=<from cloudinary.com dashboard>
   CLOUDINARY_API_SECRET=<from cloudinary.com dashboard>
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=<your gmail address>
   EMAIL_PASS=<gmail app password>
   EMAIL_FROM=noreply@teamchat.com
   ```

   **Note:** Don't set `PORT` — Railway sets it automatically. If you want Google OAuth, also add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`.

7. Go to **Settings** → **Networking** → click **Generate Domain**. You'll get a URL like:
   ```
   https://your-app-production.up.railway.app
   ```
8. Copy this URL — you'll need it for Vercel.

#### Step 3 — Deploy Frontend to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. **Add New Project** → import your repository
3. **Configure Project**:
   - **Root Directory**: `client`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
4. **Environment Variables** — add these:
   ```
   NEXT_PUBLIC_API_URL=https://your-app-production.up.railway.app/api
   NEXT_PUBLIC_SOCKET_URL=https://your-app-production.up.railway.app
   ```
   (Use the Railway URL from Step 2, with `/api` appended for the API_URL only)
5. Click **Deploy**
6. After deployment, copy your Vercel URL (e.g., `https://your-app.vercel.app`)

#### Step 4 — Update Railway with Vercel URL

1. Go back to Railway → your backend service → **Variables**
2. Update these two variables with your real Vercel URL:
   ```
   CLIENT_URL=https://your-app.vercel.app
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
3. Railway will auto-redeploy

#### Step 5 — Test Your Deployment

1. Visit `https://your-app-production.up.railway.app/api/health` — should return `{"status":"ok",...}`
2. Visit your Vercel URL → register a new account → verify email → login → create workspace

#### Optional: Custom Domain

- **Vercel:** Settings → Domains → add your domain
- **Railway:** Settings → Networking → Custom Domain
- After adding, update `CLIENT_URL` and `ALLOWED_ORIGINS` on Railway with the new domain

#### Common Issues

| Problem | Solution |
|---|---|
| CORS error in browser | Make sure `ALLOWED_ORIGINS` on Railway exactly matches your Vercel URL (no trailing slash) |
| `ECONNREFUSED` MongoDB | Verify Atlas Network Access allows `0.0.0.0/0` |
| Health check fails | Check Railway logs — usually a missing env var |
| Socket.io disconnects | Make sure `NEXT_PUBLIC_SOCKET_URL` does NOT have `/api` at the end |
| Email OTP not sent | For Gmail, use an App Password (not your real password) |

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
