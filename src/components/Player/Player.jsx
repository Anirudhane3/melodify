import { useMusic } from '../../context/MusicContext';
import { useAuth } from '../../context/AuthContext';
import { formatTime } from '../../hooks/useAudioPlayer';
import { getPlaylists, addSongToPlaylist } from '../../services/playlistService';
import { useState } from 'react';
import './Player.css';

export default function Player() {
  const {
    currentSong, isPlaying, progress, duration, currentTime,
    volume, isMuted, isLoading,
    togglePlay, handleNext, handlePrev,
    seek, setVolume, toggleMute,
    isShuffled, repeatMode, toggleShuffle, cycleRepeat,
  } = useMusic();

  const { currentUser } = useAuth();
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [toast, setToast] = useState('');

  // Does the current song have a playable audio URL?
  const hasAudio = !!currentSong?.audio_url;

  if (!currentSong) {
    return (
      <div className="player player-empty">
        <span className="player-empty-text">Select a song to start playing</span>
      </div>
    );
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    seek(Math.max(0, Math.min(100, percent)));
  };

  const handleVolume = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleAddToPlaylist = (playlistId) => {
    addSongToPlaylist(currentUser.id, playlistId, currentSong);
    setShowAddToPlaylist(false);
    showToast(`Added to playlist`);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const playlists = getPlaylists(currentUser?.id);

  return (
    <>
      <div className="player">
        {/* ── Left: Song Info ── */}
        <div className="player-left">
          <div className="player-cover-wrap">
            <img
              src={currentSong.cover_url || 'https://picsum.photos/seed/default/56/56'}
              alt={currentSong.title}
              className="player-cover"
            />
            {isPlaying && (
              <div className="player-cover-eq">
                <div className="equalizer">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>
          <div className="player-song-info">
            <span className="player-song-title truncate">{currentSong.title}</span>
            <span className="player-song-artist truncate">{currentSong.artist}</span>
            {!hasAudio && (
              <span className="player-no-audio">No audio file — add to Firebase</span>
            )}
          </div>
          <button
            className={`btn-icon player-add-btn ${showAddToPlaylist ? 'active' : ''}`}
            title="Add to playlist"
            onClick={() => setShowAddToPlaylist(v => !v)}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          {/* Add to playlist dropdown */}
          {showAddToPlaylist && (
            <div className="player-playlist-dropdown">
              <p className="player-playlist-dropdown-title">Add to playlist</p>
              {playlists.length === 0 ? (
                <p className="player-playlist-empty">No playlists yet. Create one in the sidebar.</p>
              ) : (
                playlists.map(pl => (
                  <button
                    key={pl.id}
                    className="player-playlist-option"
                    onClick={() => handleAddToPlaylist(pl.id)}
                  >
                    {pl.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Center: Controls + Seek ── */}
        <div className="player-center">
          <div className="player-controls">
            {/* Shuffle */}
            <button
              className={`btn-icon ${isShuffled ? 'active' : ''}`}
              title="Shuffle"
              onClick={toggleShuffle}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </button>

            {/* Prev */}
            <button className="btn-icon player-skip-btn" title="Previous" onClick={handlePrev}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              className={`player-play-btn ${isLoading ? 'loading' : ''}`}
              title={!hasAudio ? 'No audio file available' : isPlaying ? 'Pause' : 'Play'}
              onClick={hasAudio ? togglePlay : undefined}
              disabled={isLoading || !hasAudio}
              style={!hasAudio ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              {isLoading ? (
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : isPlaying ? (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Next */}
            <button className="btn-icon player-skip-btn" title="Next" onClick={handleNext}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            {/* Repeat */}
            <button
              className={`btn-icon ${repeatMode !== 'off' ? 'active' : ''}`}
              title={`Repeat: ${repeatMode}`}
              onClick={cycleRepeat}
            >
              {repeatMode === 'one' ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  <text x="10" y="15" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">1</text>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              )}
            </button>
          </div>

          {/* Seek Bar */}
          <div className="player-seek-row">
            <span className="player-time">{formatTime(currentTime)}</span>
            <div className="player-seek-bar" onClick={handleSeek}>
              <div className="player-seek-track">
                <div className="player-seek-fill" style={{ width: `${progress}%` }} />
                <div className="player-seek-thumb" style={{ left: `${progress}%` }} />
              </div>
            </div>
            <span className="player-time">{formatTime(duration)}</span>
          </div>
        </div>

        {/* ── Right: Volume ── */}
        <div className="player-right">
          <button className="btn-icon" title="Mute" onClick={toggleMute}>
            {isMuted || volume === 0 ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18L19 19.27 20.27 18 5.27 3 4.27 3zM12 4 9.91 6.09 12 8.18V4z"/>
              </svg>
            ) : volume < 0.5 ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
            className="player-volume-slider"
          />
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
