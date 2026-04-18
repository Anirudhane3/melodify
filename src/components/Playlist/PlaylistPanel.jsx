import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMusic } from '../../context/MusicContext';
import {
  getPlaylists, createPlaylist, deletePlaylist,
  removeSongFromPlaylist, getPlaylistById,
} from '../../services/playlistService';
import SongCard from '../SongCard/SongCard';
import './Playlist.css';

export default function PlaylistPanel({ activePlaylistId = null }) {
  const { currentUser } = useAuth();
  const { playPlaylist } = useMusic();

  const [playlists, setPlaylists] = useState(() => getPlaylists(currentUser?.id));
  const [selected, setSelected]   = useState(activePlaylistId);
  const [creating, setCreating]   = useState(false);
  const [newName,  setNewName]    = useState('');

  const refresh = () => setPlaylists(getPlaylists(currentUser?.id));

  const handleCreate = () => {
    if (!newName.trim()) return;
    createPlaylist(currentUser.id, newName.trim());
    setNewName('');
    setCreating(false);
    refresh();
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this playlist?')) return;
    deletePlaylist(currentUser.id, id);
    if (selected === id) setSelected(null);
    refresh();
  };

  const handleRemoveSong = (playlistId, songId) => {
    removeSongFromPlaylist(currentUser.id, playlistId, songId);
    refresh();
  };

  const selectedPlaylist = selected ? getPlaylistById(currentUser?.id, selected) : null;

  return (
    <div className="playlist-panel">
      {/* ── Left: Playlist sidebar ── */}
      <div className="playlist-sidebar">
        <div className="playlist-sidebar-header">
          <h2 className="playlist-sidebar-title">Playlists</h2>
          <button
            className="btn btn-primary playlist-create-btn"
            onClick={() => setCreating(true)}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New
          </button>
        </div>

        {/* Create form */}
        {creating && (
          <div className="playlist-create-form">
            <input
              className="input-field"
              placeholder="Playlist name…"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') { setCreating(false); setNewName(''); }
              }}
              autoFocus
            />
            <div className="playlist-create-actions">
              <button className="btn btn-primary" onClick={handleCreate} style={{ padding: '7px 16px', fontSize: 13 }}>Create</button>
              <button className="btn btn-ghost" onClick={() => { setCreating(false); setNewName(''); }}>Cancel</button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="playlist-list">
          {playlists.length === 0 ? (
            <div className="playlist-empty-state">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                <path d="M9 18V6l12-2v12" strokeLinecap="round"/>
                <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
              <p>No playlists yet</p>
              <button className="btn btn-secondary" onClick={() => setCreating(true)}>Create one</button>
            </div>
          ) : (
            playlists.map(pl => (
              <div
                key={pl.id}
                className={`playlist-item ${selected === pl.id ? 'playlist-item--active' : ''}`}
                onClick={() => setSelected(pl.id)}
              >
                <div className="playlist-item-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M9 18V6l12-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
                <div className="playlist-item-info">
                  <span className="playlist-item-name truncate">{pl.name}</span>
                  <span className="playlist-item-count">{pl.songs.length} songs</span>
                </div>
                <button
                  className="playlist-item-delete"
                  onClick={e => { e.stopPropagation(); handleDelete(pl.id); }}
                  title="Delete playlist"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right: Selected Playlist Detail ── */}
      <div className="playlist-detail">
        {!selectedPlaylist ? (
          <div className="playlist-detail-empty">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="var(--text-muted)" strokeWidth="1">
              <path d="M9 18V6l12-2v12" strokeLinecap="round"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
            <h3>Select a playlist</h3>
            <p>Choose a playlist from the left to view its songs.</p>
          </div>
        ) : (
          <>
            {/* Playlist hero */}
            <div className="playlist-hero">
              <div className="playlist-hero-art">
                {selectedPlaylist.songs.slice(0, 4).map((s, i) => (
                  <img key={i} src={s.cover_url || `https://picsum.photos/seed/${s.id}/80/80`} alt="" />
                ))}
                {selectedPlaylist.songs.length === 0 && (
                  <div className="playlist-hero-art-empty">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                      <path d="M9 18V6l12-2v12" strokeLinecap="round"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="playlist-hero-info">
                <span className="playlist-hero-label">Playlist</span>
                <h1 className="playlist-hero-name">{selectedPlaylist.name}</h1>
                <p className="playlist-hero-meta">
                  {selectedPlaylist.songs.length} songs
                  {selectedPlaylist.songs.length > 0 && (
                    <> · <span>{currentUser?.username}</span></>
                  )}
                </p>
                {selectedPlaylist.songs.length > 0 && (
                  <button
                    className="btn btn-primary playlist-play-btn"
                    onClick={() => playPlaylist(selectedPlaylist)}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play
                  </button>
                )}
              </div>
            </div>

            {/* Songs */}
            {selectedPlaylist.songs.length === 0 ? (
              <div className="playlist-songs-empty">
                <p>This playlist is empty.</p>
                <p>Go to <strong>Home</strong> and click the ⋮ menu on any song to add it here.</p>
              </div>
            ) : (
              <>
                {/* Column header */}
                <div className="song-list-header" style={{ marginTop: 24 }}>
                  <span>#</span><span></span><span>Title</span>
                  <span>Album</span><span className="col-right">Duration</span>
                </div>
                <div className="playlist-songs-list">
                  {selectedPlaylist.songs.map((song, i) => (
                    <div key={song.id} className="playlist-song-row">
                      <SongCard
                        song={song}
                        index={i}
                        queueList={selectedPlaylist.songs}
                      />
                      <button
                        className="playlist-song-remove"
                        title="Remove from playlist"
                        onClick={() => { handleRemoveSong(selected, song.id); }}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
