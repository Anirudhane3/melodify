import { useState, useMemo } from 'react';
import { useMusic } from '../../context/MusicContext';
import SongCard from '../SongCard/SongCard';
import './SongList.css';

export default function SongList({ songs: propSongs, title = 'All Songs', showSearch = true }) {
  const { songs: ctxSongs, isLoadingSongs } = useMusic();
  const songs = propSongs || ctxSongs;

  const [search, setSearch]   = useState('');
  const [sortBy, setSortBy]   = useState('title'); // 'title' | 'artist' | 'album'
  const [genre,  setGenre]    = useState('All');

  // All unique genres
  const genres = useMemo(() => {
    const g = new Set(songs.map(s => s.genre).filter(Boolean));
    return ['All', ...Array.from(g).sort()];
  }, [songs]);

  // Filtered + sorted
  const filtered = useMemo(() => {
    let list = songs;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.title?.toLowerCase().includes(q) ||
        s.artist?.toLowerCase().includes(q) ||
        s.album?.toLowerCase().includes(q)
      );
    }
    if (genre !== 'All') {
      list = list.filter(s => s.genre === genre);
    }
    return [...list].sort((a, b) => {
      const av = (a[sortBy] || '').toLowerCase();
      const bv = (b[sortBy] || '').toLowerCase();
      return av.localeCompare(bv);
    });
  }, [songs, search, genre, sortBy]);

  if (isLoadingSongs) {
    return (
      <div className="song-list-loading">
        <div className="spinner" />
        <p>Loading songs…</p>
      </div>
    );
  }

  return (
    <div className="song-list">
      {/* Header */}
      <div className="song-list-top">
        <h2 className="song-list-title">{title}</h2>
        <span className="badge">{filtered.length} songs</span>
      </div>

      {/* Search + Filters */}
      {showSearch && (
        <div className="song-list-filters">
          <div className="song-list-search-wrap">
            <svg className="song-list-search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="input-field song-list-search"
              placeholder="Search songs, artists, albums…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="song-list-clear-btn" onClick={() => setSearch('')}>×</button>
            )}
          </div>

          <div className="song-list-sort">
            <label className="song-list-sort-label">Sort:</label>
            {['title', 'artist', 'album'].map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`song-list-sort-btn ${sortBy === s ? 'active' : ''}`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Genre filter pills */}
          {genres.length > 1 && (
            <div className="song-list-genres">
              {genres.map(g => (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  className={`song-list-genre-pill ${genre === g ? 'active' : ''}`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Column Headers */}
      <div className="song-list-header">
        <span>#</span>
        <span></span>
        <span>Title</span>
        <span>Album</span>
        <span className="col-right">Duration</span>
      </div>

      {/* Rows */}
      {filtered.length === 0 ? (
        <div className="song-list-empty">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <p>No songs found</p>
          {search && <button className="btn btn-ghost" onClick={() => setSearch('')}>Clear search</button>}
        </div>
      ) : (
        <div className="song-list-rows">
          {filtered.map((song, i) => (
            <SongCard
              key={song.id}
              song={song}
              index={i}
              queueList={filtered}
            />
          ))}
        </div>
      )}
    </div>
  );
}
