import { useMusic } from '../../context/MusicContext';
import { useAuth } from '../../context/AuthContext';
import {
  getPlaylists,
  addSongToPlaylist,
} from '../../services/playlistService';
import { useState } from 'react';
import './SongCard.css';

export default function SongCard({ song, index, queueList }) {
  const { playSong, currentSong, isPlaying } = useMusic();
  const { currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');

  const isActive = currentSong?.id === song.id;
  const playlists = getPlaylists(currentUser?.id);

  const handlePlay = () => {
    playSong(song, queueList, index);
  };

  const handleAddToPlaylist = (playlistId) => {
    addSongToPlaylist(currentUser.id, playlistId, song);
    setMenuOpen(false);
    setToast('Added!');
    setTimeout(() => setToast(''), 1500);
  };

  return (
    <div className={`song-card ${isActive ? 'song-card--active' : ''}`}
      onDoubleClick={handlePlay}
    >
      {/* Index / Equalizer */}
      <div className="song-card-index">
        {isActive && isPlaying ? (
          <div className="equalizer">
            <span /><span /><span />
          </div>
        ) : (
          <span className="song-card-num">{index + 1}</span>
        )}
        <button className="song-card-play-overlay btn-icon" onClick={handlePlay} title="Play">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {/* Cover */}
      <div className="song-card-cover-wrap">
        <img
          src={song.cover_url || `https://picsum.photos/seed/${song.id}/40/40`}
          alt={song.title}
          className="song-card-cover"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="song-card-info">
        <span className={`song-card-title truncate ${isActive ? 'song-card-title--active' : ''}`}>
          {song.title}
        </span>
        <span className="song-card-artist truncate">{song.artist}</span>
      </div>

      {/* Album */}
      <span className="song-card-album truncate">{song.album}</span>

      {/* Duration + Menu */}
      <div className="song-card-right">
        <span className="song-card-duration">{song.duration || '--:--'}</span>
        <div className="song-card-menu-wrap">
          <button
            className="btn-icon song-card-menu-btn"
            title="More options"
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
          {menuOpen && (
            <div className="song-card-dropdown" onClick={e => e.stopPropagation()}>
              <p className="song-card-dropdown-title">Add to playlist</p>
              {playlists.length === 0 ? (
                <p className="song-card-dropdown-empty">No playlists yet</p>
              ) : (
                playlists.map(pl => (
                  <button
                    key={pl.id}
                    className="song-card-dropdown-item"
                    onClick={() => handleAddToPlaylist(pl.id)}
                  >{pl.name}</button>
                ))
              )}
            </div>
          )}
        </div>
        {toast && <span className="song-card-toast">{toast}</span>}
      </div>
    </div>
  );
}
