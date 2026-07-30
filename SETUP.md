# ThinkPost AI — Setup Guide

This guide walks you through the external service configuration required before running ThinkPost AI locally.

---

## Prerequisites

- **Node.js** ≥ 18 (v24 confirmed working)
- **npm** ≥ 9

---

## 1. Supabase Setup (Postgres Database)

Supabase is used **purely as a managed Postgres database** — no Supabase Auth, no RLS.

### 1.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **"New Project"**.
3. Choose your organization (or create one).
4. Set:
   - **Name:** `thinkpost-ai` (or any name you prefer)
   - **Database Password:** generate a strong password and save it
   - **Region:** pick one close to your users
   - **Plan:** Free tier (500 MB database)
5. Click **"Create new project"** and wait for it to provision (~2 minutes).

### 1.2 Get Your Credentials

1. In your Supabase project dashboard, go to **Settings → API**.
2. Copy these two values:
   - **Project URL** → this is your `SUPABASE_URL`
   - **Service role key** (under "Project API keys") → this is your `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ **The service role key bypasses all Supabase security policies.** It is used server-side only and must NEVER be exposed in client-side code or environment variables prefixed with `NEXT_PUBLIC_`.

### 1.3 Run the Database Migration

1. In the Supabase dashboard, go to **SQL Editor**.
2. Click **"New Query"**.
3. Copy the entire contents of [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) and paste it into the editor.
4. Click **"Run"**.
5. Verify: go to **Table Editor** — you should see 5 tables: `users`, `profile`, `writing_style`, `memories`, `posts`.

### 1.4 Staging Environment (for Vercel Previews)

Per FRD Section 6 (Staging): create a **separate** Supabase project for preview/staging deployments. Production data must never be shared with previews.

1. Repeat steps 1.1–1.3 with a project named `thinkpost-ai-staging`.
2. Use these credentials in your Vercel preview environment variables.

---

## 2. WorkOS AuthKit Setup

WorkOS handles both dashboard login AND MCP OAuth 2.1 authorization.

### 2.1 Create a WorkOS Account

1. Go to [https://workos.com](https://workos.com) and sign up (free up to 1M MAU).
2. Create a new **Environment** (you'll have a staging and production environment).

### 2.2 Configure Authentication

1. In the WorkOS Dashboard, go to **Authentication**.
2. Under **Redirect URIs**, add:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://your-production-domain.vercel.app/auth/callback` (for production)
3. Under **Authentication Methods**, enable:
   - **Email + Password** (required)
   - **Social Login** (optional — Google, GitHub, etc. as desired)

### 2.3 Get Your Credentials

1. Go to **API Keys** in the WorkOS dashboard.
2. Copy:
   - **API Key** → this is your `WORKOS_API_KEY`
   - **Client ID** → this is your `WORKOS_CLIENT_ID`
3. Generate a cookie password:
   - This is a random string ≥ 32 characters, used to encrypt session cookies.
   - You can generate one with: `openssl rand -hex 16` (or any password generator)
   - This is your `WORKOS_COOKIE_PASSWORD`

### 2.4 Set the Redirect URI

Set `WORKOS_REDIRECT_URI` to match what you configured in step 2.2:
- Local: `http://localhost:3000/auth/callback`
- Production: `https://your-domain.vercel.app/auth/callback`

### 2.5 MCP OAuth 2.1 Configuration

WorkOS AuthKit natively supports the MCP OAuth 2.1 specification:
- **Dynamic Client Registration (DCR)** — AI clients can register automatically
- **PKCE** — Proof Key for Code Exchange for secure public clients
- **Resource Indicators** — scope access to specific resources

This is configured at the WorkOS level. The ThinkPost AI codebase handles token verification via the WorkOS SDK — no additional OAuth server code needed.

---

## 3. Upstash Redis Setup (Rate Limiting)

Upstash provides serverless Redis used exclusively for rate limiting MCP tool calls.

### 3.1 Create an Upstash Account

1. Go to [https://upstash.com](https://upstash.com) and sign up (free tier: ~10k commands/day).
2. Click **"Create Database"**.
3. Set:
   - **Name:** `thinkpost-ai-ratelimit`
   - **Region:** pick the same region as your Vercel deployment
   - **Type:** Regional
4. Click **"Create"**.

### 3.2 Get Your Credentials

1. In the database details page, find the **REST API** section.
2. Copy:
   - **UPSTASH_REDIS_REST_URL** → the REST endpoint URL
   - **UPSTASH_REDIS_REST_TOKEN** → the REST auth token

---

## 4. Configure Environment Variables

1. Copy the template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in all values from the steps above:
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   WORKOS_API_KEY=sk_test_...
   WORKOS_CLIENT_ID=client_...
   WORKOS_REDIRECT_URI=http://localhost:3000/auth/callback
   WORKOS_COOKIE_PASSWORD=your-32-char-random-string
   UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXxx...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

---

## 5. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Deploy to Vercel

1. Push your repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add all environment variables from `.env.local` to Vercel's project settings:
   - **Production** environment: use production Supabase + WorkOS credentials
   - **Preview** environment: use staging Supabase credentials (separate project)
4. Deploy.

---

## Environment Variables Reference

| Variable | Source | Required |
|----------|--------|----------|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key | Yes |
| `WORKOS_API_KEY` | WorkOS → API Keys | Yes |
| `WORKOS_CLIENT_ID` | WorkOS → API Keys → Client ID | Yes |
| `WORKOS_REDIRECT_URI` | Must match WorkOS dashboard config | Yes |
| `WORKOS_COOKIE_PASSWORD` | Self-generated, ≥ 32 characters | Yes |
| `UPSTASH_REDIS_REST_URL` | Upstash → Database → REST API | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash → Database → REST API | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | Yes |
