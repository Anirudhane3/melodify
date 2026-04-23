import { useState } from 'react';
import SongCard from '../SongCard/SongCard';

export default function SongList({ songs, title, showSearch }) {
  const [search, setSearch] = useState('');

  const filtered = showSearch && search
    ? songs.filter(s =>
        s.title?.toLowerCase().includes(search.toLowerCase()) ||
        s.artist?.toLowerCase().includes(search.toLowerCase())
      )
    : songs;

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
        {showSearch && (
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search songs…"
              className="pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-colors w-52"
            />
          </div>
        )}
      </div>

      {/* Song rows */}
      {filtered.length === 0
        ? <p className="text-zinc-500 text-sm py-8 text-center">No songs found.</p>
        : <div className="space-y-1">
            {filtered.map((song, i) => (
              <SongCard key={song.id} song={song} queueList={filtered} index={i} />
            ))}
          </div>
      }
    </div>
  );
}
