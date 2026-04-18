# Melodify — Supabase + Backblaze B2 Setup Guide

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) → **Sign up / Log in**
2. Click **New Project** → fill in name, password, region → **Create**
3. Wait ~2 mins for setup

---

## Step 2: Create the `songs` Table

In Supabase → **SQL Editor** → run:

```sql
CREATE TABLE songs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  artist      TEXT        NOT NULL,
  album       TEXT,
  genre       TEXT,
  duration    TEXT,
  cover_url   TEXT,
  audio_url   TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read songs (public music app)
CREATE POLICY "Public songs read"
  ON songs FOR SELECT
  USING (true);
```

---

## Step 3: Get Your API Keys

1. Supabase → **Project Settings** → **API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public** key → `VITE_SUPABASE_ANON_KEY`

3. Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 4: Set Up Backblaze B2

1. Go to [https://www.backblaze.com/b2/cloud-storage.html](https://www.backblaze.com/b2/cloud-storage.html) → **Sign up free**
2. Create a **Bucket**:
   - Name: `melodify-songs`
   - Files: **Public**
3. Upload your `.mp3` files and album artwork images

Each file gets a URL like:
```
https://f005.backblazeb2.com/file/melodify-songs/song1.mp3
```

> **Optional (recommended):** Connect Backblaze to **Cloudflare** for free bandwidth.
> See: https://www.backblaze.com/blog/backblaze-and-cloudflare-partner

---

## Step 5: Add Songs to Supabase

### Option A: Supabase Table Editor (GUI)
- Go to **Table Editor** → `songs` → **Insert row**
- Fill in: title, artist, album, genre, duration, cover_url, audio_url

### Option B: SQL Insert
```sql
INSERT INTO songs (title, artist, album, genre, duration, cover_url, audio_url)
VALUES
  ('Song Title', 'Artist Name', 'Album', 'Pop', '3:45',
   'https://f005.backblazeb2.com/file/melodify-songs/cover1.jpg',
   'https://f005.backblazeb2.com/file/melodify-songs/song1.mp3'),
  -- repeat for all songs...
;
```

### Option C: Bulk Import CSV
- Export a CSV with columns: title, artist, album, genre, duration, cover_url, audio_url
- Supabase → Table Editor → Import CSV

---

## Step 6: Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

1. Register a new account
2. Your songs will load from Supabase automatically
3. Click any song → it streams from Backblaze B2

---

## Deployment to Netlify

```bash
npm run build
```

1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Deploy manually**
2. Drag the `dist/` folder into Netlify
3. Go to **Site settings** → **Environment variables** → Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Redeploy** — done!

Your app is now live and anyone with the link can listen 🎵
