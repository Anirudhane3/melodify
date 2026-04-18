import { useState, useEffect, useCallback } from 'react';
import {
  collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, orderBy, query
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminUpload.css';

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// ── Cloudinary upload helper ──────────────────────────────────────────────────
async function uploadToCloudinary(file, resourceType, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status === 200) resolve(JSON.parse(xhr.responseText).secure_url);
      else reject(new Error('Upload failed'));
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

const GENRES = ['Pop','Rock','Hip-Hop','R&B','Electronic','Jazz','Classical',
                'Country','Tamil','Hindi','Telugu','Malayalam','Kannada','Other'];

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminUpload() {
  const { currentUser, getAllUsers, grantAdmin, revokeAdmin, createAdminUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'songs' | 'admins'

  // Redirect non-admins
  useEffect(() => {
    if (currentUser && !currentUser.isAdmin) navigate('/');
  }, [currentUser, navigate]);

  if (!currentUser?.isAdmin) return null;

  return (
    <div className="admin-page page-container">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Admin Panel</h1>
          <p className="admin-subtitle">
            {currentUser.isPrimaryAdmin ? '👑 Primary Admin' : '🛡️ Admin'} — {currentUser.username}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>← Back to app</button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
          </svg>
          Upload Song
        </button>
        <button className={`admin-tab ${activeTab === 'songs' ? 'active' : ''}`}
          onClick={() => setActiveTab('songs')}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
          </svg>
          Manage Songs
        </button>
        {currentUser.isPrimaryAdmin && (
          <button className={`admin-tab ${activeTab === 'admins' ? 'active' : ''}`}
            onClick={() => setActiveTab('admins')}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            Manage Admins
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' && <UploadTab currentUser={currentUser} />}
      {activeTab === 'songs'  && <SongsTab />}
      {activeTab === 'admins' && currentUser.isPrimaryAdmin && (
        <AdminsTab
          getAllUsers={getAllUsers}
          grantAdmin={grantAdmin}
          revokeAdmin={revokeAdmin}
          createAdminUser={createAdminUser}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

// ── Tab 1: Upload Song ────────────────────────────────────────────────────────
function UploadTab({ currentUser }) {
  const [form, setForm] = useState({
    title: '', artist: '', album: '', genre: 'Tamil', duration: '',
  });
  const [audioFile,  setAudioFile]  = useState(null);
  const [coverFile,  setCoverFile]  = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [audioProgress, setAudioProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [status,  setStatus]  = useState('idle');
  const [message, setMessage] = useState('');
  const [uploaded, setUploaded] = useState([]);

  const handleField = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleAudio = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAudioFile(file);
    // Auto-fill title from filename
    const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setForm(f => ({ ...f, title: f.title || name }));
  };

  const handleCover = (e) => {
    const file = e.target.files[0];
    if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) return setMessage('⚠️ Please select an MP3 file');
    if (!form.title || !form.artist) return setMessage('⚠️ Title and Artist are required');

    setStatus('uploading'); setMessage(''); setAudioProgress(0); setCoverProgress(0);

    try {
      setMessage('🎵 Uploading audio…');
      const audioUrl = await uploadToCloudinary(audioFile, 'video', setAudioProgress);

      let coverUrl = '';
      if (coverFile) {
        setMessage('🖼️ Uploading cover art…');
        coverUrl = await uploadToCloudinary(coverFile, 'image', setCoverProgress);
      }

      setMessage('💾 Saving to Firestore…');
      const songData = {
        title:       form.title.trim(),
        artist:      form.artist.trim(),
        album:       form.album.trim() || 'Unknown Album',
        genre:       form.genre,
        duration:    form.duration.trim() || '',
        audio_url:   audioUrl,
        cover_url:   coverUrl,
        uploaded_by: currentUser?.username || 'admin',
        created_at:  serverTimestamp(),
      };
      await addDoc(collection(db, 'songs'), songData);

      setUploaded(prev => [{ ...songData, id: Date.now() }, ...prev]);
      setStatus('success');
      setMessage(`✅ "${form.title}" uploaded successfully!`);
      setForm({ title: '', artist: '', album: '', genre: 'Tamil', duration: '' });
      setAudioFile(null); setCoverFile(null); setCoverPreview('');
      setAudioProgress(0); setCoverProgress(0);
      setTimeout(() => { setStatus('idle'); setMessage(''); }, 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('❌ Error: ' + err.message);
    }
  };

  return (
    <div className="admin-layout">
      <form className="admin-form card" onSubmit={handleSubmit}>
        {/* Song Details */}
        <section className="admin-section">
          <h2 className="admin-section-title">Song Details</h2>
          <div className="admin-fields">
            <div className="admin-field">
              <label>Title *</label>
              <input className="input-field" name="title" value={form.title}
                onChange={handleField} placeholder="e.g. Blinding Lights" required />
            </div>
            <div className="admin-field">
              <label>Artist *</label>
              <input className="input-field" name="artist" value={form.artist}
                onChange={handleField} placeholder="e.g. The Weeknd" required />
            </div>
            <div className="admin-field">
              <label>Album</label>
              <input className="input-field" name="album" value={form.album}
                onChange={handleField} placeholder="e.g. After Hours" />
            </div>
            <div className="admin-field">
              <label>Duration</label>
              <input className="input-field" name="duration" value={form.duration}
                onChange={handleField} placeholder="e.g. 3:22" />
            </div>
            <div className="admin-field">
              <label>Genre</label>
              <select className="input-field" name="genre" value={form.genre} onChange={handleField}>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Audio File */}
        <section className="admin-section">
          <h2 className="admin-section-title">Audio File (MP3) *</h2>
          <label className={`admin-dropzone ${audioFile ? 'has-file' : ''}`}>
            <input type="file" accept="audio/*" onChange={handleAudio} hidden />
            {audioFile ? (
              <>
                <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--accent)">
                  <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
                </svg>
                <span className="admin-dropzone-name">{audioFile.name}</span>
                <span className="admin-dropzone-size">{(audioFile.size/(1024*1024)).toFixed(1)} MB</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--text-muted)">
                  <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
                </svg>
                <span>Click to select MP3 file</span>
                <span className="admin-dropzone-hint">MP3, WAV, AAC supported</span>
              </>
            )}
          </label>
          {audioProgress > 0 && audioProgress < 100 && (
            <div className="admin-progress-wrap">
              <div className="admin-progress-bar" style={{ width: `${audioProgress}%` }} />
              <span>{audioProgress}%</span>
            </div>
          )}
        </section>

        {/* Cover Art */}
        <section className="admin-section">
          <h2 className="admin-section-title">Cover Art (Optional)</h2>
          <label className={`admin-dropzone admin-cover-drop ${coverFile ? 'has-file' : ''}`}>
            <input type="file" accept="image/*" onChange={handleCover} hidden />
            {coverPreview
              ? <img src={coverPreview} alt="cover" className="admin-cover-preview" />
              : (<>
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--text-muted)">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                  <span>Click to select image</span>
                </>)
            }
          </label>
          {coverProgress > 0 && coverProgress < 100 && (
            <div className="admin-progress-wrap">
              <div className="admin-progress-bar" style={{ width: `${coverProgress}%` }} />
              <span>{coverProgress}%</span>
            </div>
          )}
        </section>

        {message && <div className={`admin-message ${status}`}>{message}</div>}

        <button type="submit" className="btn btn-primary admin-submit" disabled={status === 'uploading'}>
          {status === 'uploading'
            ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Uploading…</>
            : <><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
              </svg> Upload Song</>
          }
        </button>
      </form>

      {/* Recently uploaded */}
      <div className="admin-recent">
        <h2 className="admin-section-title">Recently Uploaded</h2>
        {uploaded.length === 0
          ? <div className="admin-recent-empty"><p>Songs you upload will appear here</p></div>
          : <div className="admin-recent-list">
              {uploaded.map(s => (
                <div key={s.id} className="admin-recent-item">
                  <img src={s.cover_url || `https://picsum.photos/seed/${s.id}/40/40`}
                    alt={s.title} className="admin-recent-cover" />
                  <div className="admin-recent-info">
                    <span className="admin-recent-title">{s.title}</span>
                    <span className="admin-recent-artist">{s.artist} · {s.genre}</span>
                  </div>
                  <span className="admin-recent-badge">✅ Live</span>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}

// ── Tab 2: Manage Songs ───────────────────────────────────────────────────────
function SongsTab() {
  const [songs,   setSongs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [deleting, setDeleting] = useState(null);
  const [toast,   setToast]   = useState('');

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    try {
      const q    = query(collection(db, 'songs'), orderBy('title'));
      const snap = await getDocs(q);
      setSongs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSongs(); }, [fetchSongs]);

  const handleDelete = async (song) => {
    if (!window.confirm(`Delete "${song.title}" by ${song.artist}? This cannot be undone.`)) return;
    setDeleting(song.id);
    try {
      await deleteDoc(doc(db, 'songs', song.id));
      setSongs(prev => prev.filter(s => s.id !== song.id));
      setToast(`🗑️ Deleted "${song.title}"`);
      setTimeout(() => setToast(''), 3000);
    } catch (e) {
      setToast('❌ Failed to delete: ' + e.message);
      setTimeout(() => setToast(''), 4000);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = songs.filter(s =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.artist?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-songs-tab card">
      <div className="admin-songs-header">
        <div className="admin-songs-count">{songs.length} songs in library</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input className="input-field admin-songs-search" placeholder="Search songs…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-ghost" onClick={fetchSongs} title="Refresh">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-songs-loading">
          <div className="spinner" /><span>Loading songs…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-recent-empty"><p>No songs found</p></div>
      ) : (
        <div className="admin-songs-list">
          <div className="admin-songs-list-header">
            <span>#</span><span>Title</span><span>Artist</span>
            <span>Genre</span><span>Duration</span><span>Action</span>
          </div>
          {filtered.map((song, i) => (
            <div key={song.id} className={`admin-song-row ${deleting === song.id ? 'deleting' : ''}`}>
              <span className="admin-song-num">{i + 1}</span>
              <div className="admin-song-title-cell">
                <img src={song.cover_url || `https://picsum.photos/seed/${song.id}/32/32`}
                  alt={song.title} className="admin-song-cover" />
                <span className="admin-song-title">{song.title}</span>
              </div>
              <span className="admin-song-artist">{song.artist}</span>
              <span className="admin-song-genre">{song.genre}</span>
              <span className="admin-song-dur">{song.duration || '—'}</span>
              <button
                className="btn-icon admin-delete-btn"
                onClick={() => handleDelete(song)}
                disabled={deleting === song.id}
                title="Delete song"
              >
                {deleting === song.id
                  ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  : <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                }
              </button>
            </div>
          ))}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

// ── Tab 3: Manage Admins (Primary Admin Only) ─────────────────────────────────
function AdminsTab({ getAllUsers, grantAdmin, revokeAdmin, createAdminUser, currentUser }) {
  const [users,   setUsers]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form,    setForm]    = useState({ username: '', password: '' });
  const [toast,   setToast]   = useState('');
  const [status,  setStatus]  = useState('idle');

  const refresh = useCallback(() => setUsers(getAllUsers()), [getAllUsers]);
  useEffect(() => { refresh(); }, [refresh]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleGrant = (userId) => {
    grantAdmin(userId); refresh();
    showToast('✅ Admin access granted');
  };
  const handleRevoke = (userId) => {
    revokeAdmin(userId); refresh();
    showToast('🚫 Admin access revoked');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const result = createAdminUser(form.username, form.password);
    if (result.success) {
      showToast(`✅ Admin "${form.username}" created`);
      setForm({ username: '', password: '' });
      setShowForm(false);
      refresh();
    } else {
      showToast('❌ ' + result.error);
    }
    setStatus('idle');
  };

  return (
    <div className="admin-admins-tab">
      {/* Create Admin Form */}
      <div className="card admin-admins-card">
        <div className="admin-admins-header">
          <div>
            <h2 className="admin-section-title">Admin Users</h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Admins can upload and delete songs. Only you (Primary Admin) can manage admin roles.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
            {showForm ? '✕ Cancel' : '+ Create Admin'}
          </button>
        </div>

        {showForm && (
          <form className="admin-create-form" onSubmit={handleCreate}>
            <div className="admin-fields">
              <div className="admin-field">
                <label>Username *</label>
                <input className="input-field" placeholder="admin username"
                  value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
              </div>
              <div className="admin-field">
                <label>Password *</label>
                <input className="input-field" type="password" placeholder="min 6 characters"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Creating…' : 'Create Admin Account'}
            </button>
          </form>
        )}
      </div>

      {/* Users list */}
      <div className="card admin-admins-card">
        <h2 className="admin-section-title" style={{ marginBottom: 16 }}>All Users ({users.length})</h2>
        <div className="admin-users-list">
          {users.map(u => (
            <div key={u.id} className="admin-user-row">
              <img src={u.avatar} alt={u.username} className="admin-user-avatar" />
              <div className="admin-user-info">
                <span className="admin-user-name">
                  {u.username}
                  {u.isPrimaryAdmin && <span className="admin-badge primary">👑 Primary Admin</span>}
                  {u.isAdmin && !u.isPrimaryAdmin && <span className="admin-badge">🛡️ Admin</span>}
                </span>
                <span className="admin-user-since">
                  Joined {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
              {!u.isPrimaryAdmin && u.id !== currentUser.id && (
                <div className="admin-user-actions">
                  {u.isAdmin ? (
                    <button className="btn btn-ghost admin-revoke-btn" onClick={() => handleRevoke(u.id)}>
                      Revoke Admin
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => handleGrant(u.id)}
                      style={{ fontSize: 12, padding: '6px 14px' }}>
                      Grant Admin
                    </button>
                  )}
                </div>
              )}
              {(u.isPrimaryAdmin || u.id === currentUser.id) && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>You</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
