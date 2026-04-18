import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMusic } from '../../context/MusicContext';
import {
  getPlaylists,
  createPlaylist,
  deletePlaylist,
} from '../../services/playlistService';
import './Sidebar.css';

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const { playSong } = useMusic();
  const navigate = useNavigate();

  const [playlists, setPlaylists]   = useState(() =>
    getPlaylists(currentUser?.id)
  );
  const [creating,  setCreating]    = useState(false);
  const [newName,   setNewName]     = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    const pl = createPlaylist(currentUser.id, newName.trim());
    if (pl) setPlaylists(getPlaylists(currentUser.id));
    setNewName('');
    setCreating(false);
  };

  const handleDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    deletePlaylist(currentUser.id, id);
    setPlaylists(getPlaylists(currentUser.id));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <svg className="sidebar-logo-icon" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="var(--accent)" />
          <path d="M10 21.5V10.5l14 5.5-14 5.5Z" fill="#000" />
        </svg>
        <span className="sidebar-logo-text">Melodify</span>
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M12 3L4 9v12h5v-7h6v7h5V9z" />
          </svg>
          Home
        </NavLink>
        <NavLink to="/playlists" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M3 6h18M3 12h12M3 18h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </svg>
          Playlists
        </NavLink>
        {currentUser?.isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `sidebar-nav-item sidebar-nav-admin ${isActive ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
            </svg>
            Upload Song
          </NavLink>
        )}
      </nav>

      <div className="sidebar-divider" />

      {/* ── Library ── */}
      <div className="sidebar-library">
        <div className="sidebar-library-header">
          <span className="sidebar-section-title">Your Library</span>
          <button
            className="btn-icon sidebar-add-btn"
            title="Create playlist"
            onClick={() => setCreating(true)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
          </button>
        </div>

        {/* Create playlist input */}
        {creating && (
          <div className="sidebar-create-input">
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
            <div className="sidebar-create-actions">
              <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12 }} onClick={handleCreate}>Create</button>
              <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => { setCreating(false); setNewName(''); }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Playlist list */}
        <div className="sidebar-playlists">
          {playlists.length === 0 ? (
            <p className="sidebar-empty">No playlists yet.</p>
          ) : (
            playlists.map(pl => (
              <NavLink
                key={pl.id}
                to={`/playlists/${pl.id}`}
                className={({ isActive }) => `sidebar-playlist-item ${isActive ? 'active' : ''}`}
              >
                <div className="sidebar-playlist-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                    <path d="M9 18V6l12-2v12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
                <div className="sidebar-playlist-info">
                  <span className="sidebar-playlist-name truncate">{pl.name}</span>
                  <span className="sidebar-playlist-count">{pl.songs.length} songs</span>
                </div>
                <button
                  className="sidebar-playlist-delete"
                  onClick={e => handleDelete(e, pl.id)}
                  title="Delete"
                >×</button>
              </NavLink>
            ))
          )}
        </div>
      </div>

      {/* ── User ── */}
      <div className="sidebar-user">
        <img
          src={currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.username}`}
          alt={currentUser?.username}
          className="sidebar-user-avatar"
        />
        <div className="sidebar-user-info">
          <span className="sidebar-user-name truncate">{currentUser?.username}</span>
          <button className="sidebar-logout-btn" onClick={handleLogout}>Log out</button>
        </div>
      </div>
    </aside>
  );
}
