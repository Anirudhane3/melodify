import { useState, useMemo } from 'react';
import SongCard from '../SongCard/SongCard';

export default function SongList({ songs, title, showSearch }) {
  const [search, setSearch] = useState('');
  const [genre, setGenre]   = useState('All');

  // Collect unique genres from the song list
  const genres = useMemo(() => {
    const set = new Set(songs.map(s => s.genre).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [songs]);

  const filtered = useMemo(() => {
    return songs.filter(s => {
      const q = search.toLowerCase();
      const matchesSearch = !search || (
        s.title?.toLowerCase().includes(q) ||
        s.artist?.toLowerCase().includes(q) ||
        s.singer?.toLowerCase().includes(q) ||
        s.actor?.toLowerCase().includes(q) ||
        s.actress?.toLowerCase().includes(q) ||
        s.album?.toLowerCase().includes(q)
      );
      const matchesGenre = genre === 'All' || s.genre === genre;
      return matchesSearch && matchesGenre;
    });
  }, [songs, search, genre]);

  return (
    <div>
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {title && <h2 className="text-xl font-bold text-white mr-auto">{title}</h2>}

        {showSearch && (
          <>
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search songs, artists…"
                className="pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-colors w-48"
              />
            </div>

            {/* Genre filter */}
            {genres.length > 2 && (
              <select
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl px-3 py-2 text-sm text-white outline-none transition-colors"
              >
                {genres.map(g => <option key={g}>{g}</option>)}
              </select>
            )}
          </>
        )}
      </div>

      {/* Result count when filtering */}
      {showSearch && (search || genre !== 'All') && (
        <p className="text-xs text-zinc-500 mb-3">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          {genre !== 'All' && <> in <span className="text-violet-400">{genre}</span></>}
          {search && <> for "<span className="text-zinc-300">{search}</span>"</>}
        </p>
      )}

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
