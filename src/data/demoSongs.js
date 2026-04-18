/**
 * Demo song catalog — used as fallback when Supabase is not configured.
 * Replace audio_url and cover_url with your actual Backblaze B2 + Cloudflare URLs.
 *
 * Supabase Table Schema (songs):
 * ────────────────────────────────────────────────────────────
 * id          UUID        PRIMARY KEY DEFAULT gen_random_uuid()
 * title       TEXT        NOT NULL
 * artist      TEXT        NOT NULL
 * album       TEXT
 * genre       TEXT
 * duration    TEXT        (e.g. "3:45")
 * cover_url   TEXT        (URL to album art image)
 * audio_url   TEXT        NOT NULL (URL to MP3 on Backblaze B2)
 * created_at  TIMESTAMPTZ DEFAULT now()
 * ────────────────────────────────────────────────────────────
 * Enable Row Level Security → Add policy: Enable read access for all users
 */

export const demoSongs = [
  {
    id: '1',
    title: 'Midnight Drive',
    artist: 'The Neon Collective',
    album: 'City Lights',
    genre: 'Electronic',
    duration: '3:42',
    cover_url: 'https://picsum.photos/seed/song1/300/300',
    audio_url: '',
  },
  {
    id: '2',
    title: 'Golden Hour',
    artist: 'Luna & The Stars',
    album: 'Celestial',
    genre: 'Indie Pop',
    duration: '4:15',
    cover_url: 'https://picsum.photos/seed/song2/300/300',
    audio_url: '',
  },
  {
    id: '3',
    title: 'Echoes in the Rain',
    artist: 'Soundwave Project',
    album: 'Rainfall Sessions',
    genre: 'Ambient',
    duration: '5:02',
    cover_url: 'https://picsum.photos/seed/song3/300/300',
    audio_url: '',
  },
  {
    id: '4',
    title: 'Pulse',
    artist: 'Arka Ray',
    album: 'Frequency',
    genre: 'Electronic',
    duration: '3:28',
    cover_url: 'https://picsum.photos/seed/song4/300/300',
    audio_url: '',
  },
  {
    id: '5',
    title: 'Sunrise Boulevard',
    artist: 'The Neon Collective',
    album: 'City Lights',
    genre: 'Synthwave',
    duration: '4:50',
    cover_url: 'https://picsum.photos/seed/song5/300/300',
    audio_url: '',
  },
  {
    id: '6',
    title: 'Between The Clouds',
    artist: 'Zephyr Dreams',
    album: 'Atmospherics',
    genre: 'Ambient',
    duration: '6:10',
    cover_url: 'https://picsum.photos/seed/song6/300/300',
    audio_url: '',
  },
  {
    id: '7',
    title: 'Fire & Ice',
    artist: 'Nova Hearts',
    album: 'Polarity',
    genre: 'Indie Rock',
    duration: '3:55',
    cover_url: 'https://picsum.photos/seed/song7/300/300',
    audio_url: '',
  },
  {
    id: '8',
    title: 'Phantom Waves',
    artist: 'Soundwave Project',
    album: 'Ocean Drive',
    genre: 'Lo-Fi',
    duration: '4:22',
    cover_url: 'https://picsum.photos/seed/song8/300/300',
    audio_url: '',
  },
  {
    id: '9',
    title: 'Urban Jungle',
    artist: 'Arka Ray',
    album: 'Frequency',
    genre: 'Hip-Hop',
    duration: '3:10',
    cover_url: 'https://picsum.photos/seed/song9/300/300',
    audio_url: '',
  },
  {
    id: '10',
    title: 'Starfall',
    artist: 'Luna & The Stars',
    album: 'Celestial',
    genre: 'Indie Pop',
    duration: '4:35',
    cover_url: 'https://picsum.photos/seed/song10/300/300',
    audio_url: '',
  },
  {
    id: '11',
    title: 'Neon Skyline',
    artist: 'Cyberpunk Jazz',
    album: 'Future Noir',
    genre: 'Jazz Fusion',
    duration: '5:18',
    cover_url: 'https://picsum.photos/seed/song11/300/300',
    audio_url: '',
  },
  {
    id: '12',
    title: 'Solstice',
    artist: 'Zephyr Dreams',
    album: 'Seasons',
    genre: 'Ambient',
    duration: '7:02',
    cover_url: 'https://picsum.photos/seed/song12/300/300',
    audio_url: '',
  },
];
