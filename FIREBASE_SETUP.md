# Melodify — Firebase Setup Guide

## Architecture
```
Firestore     → stores song metadata (title, artist, album, genre, duration, cover_url, audio_url)
Firebase Storage → stores MP3 files + album art images  [5 GB free]
React App     → fetches metadata from Firestore, streams audio from Storage URL
```

---

## Step 1: Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `melodify` → **Create project**
3. Click **Continue**

---

## Step 2: Add a Web App

1. In Firebase Console → ⚙️ **Project Settings** → **Your apps**
2. Click **</>** (Web app icon) → name it `melodify-web` → **Register app**
3. Copy the `firebaseConfig` object — you'll need these values for your `.env`

---

## Step 3: Set Up Firestore Database

1. Firebase Console → **Firestore Database** → **Create database**
2. Choose **Start in production mode** → pick your region → **Enable**
3. Go to **Rules** tab → paste this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read songs (public music library)
    match /songs/{songId} {
      allow read: true;
      allow write: if false; // only you can add via console
    }
  }
}
```
4. Click **Publish**

---

## Step 4: Set Up Firebase Storage

1. Firebase Console → **Storage** → **Get started**
2. Choose **Start in production mode** → **Done**
3. Go to **Rules** tab → paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /songs/{fileName} {
      allow read: true;   // public streaming
      allow write: if false;
    }
    match /covers/{fileName} {
      allow read: true;   // public album art
      allow write: if false;
    }
  }
}
```
4. Click **Publish**

---

## Step 5: Create Your `.env` File

Copy `.env.example` → rename to `.env` and fill in your values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=melodify-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=melodify-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=melodify-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

Then restart the dev server: `npm run dev`

---

## Step 6: Upload Songs to Firebase Storage

### Upload MP3 files
1. Firebase Console → **Storage** → **Files**
2. Create a folder called `songs/`
3. Upload your MP3 files into `songs/`
4. For each file, click it → copy the **Download URL**

### Upload album art
1. Create a folder called `covers/`
2. Upload `.jpg` / `.png` album art
3. Copy each **Download URL**

> **Storage URLs look like:**
> `https://firebasestorage.googleapis.com/v0/b/melodify-xxx.appspot.com/o/songs%2Fsong1.mp3?alt=media`

---

## Step 7: Add Songs to Firestore

### Option A: Firebase Console (manual, good for testing)
1. Firestore → **+ Start collection** → ID: `songs`
2. Add a document (auto-ID) with fields:

| Field       | Type   | Example                    |
|-------------|--------|----------------------------|
| title       | string | "Blinding Lights"          |
| artist      | string | "The Weeknd"               |
| album       | string | "After Hours"              |
| genre       | string | "Pop"                      |
| duration    | string | "3:22"                     |
| cover_url   | string | https://... (Storage URL)  |
| audio_url   | string | https://... (Storage URL)  |

### Option B: Bulk import via script (for 2000 songs)
Create a `scripts/importSongs.mjs` file:

```js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = { /* paste your config */ };
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

const songs = [
  {
    title: "Song 1", artist: "Artist", album: "Album",
    genre: "Pop", duration: "3:45",
    cover_url: "https://firebasestorage.googleapis.com/.../cover1.jpg?alt=media",
    audio_url:  "https://firebasestorage.googleapis.com/.../song1.mp3?alt=media",
  },
  // ... all 2000 songs
];

for (const song of songs) {
  await addDoc(collection(db, 'songs'), song);
  console.log('Added:', song.title);
}
```

Run: `node scripts/importSongs.mjs`

---

## Step 8: Deploy to Netlify / Vercel

1. Build: `npm run build`
2. Deploy the `dist/` folder
3. Add all `VITE_FIREBASE_*` variables as **Environment Variables** in Netlify/Vercel
4. Redeploy → done! 🎉

Your app is live and anyone with the link can stream your music from Firebase.
