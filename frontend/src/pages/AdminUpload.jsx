import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const GENRES = ['Pop','Rock','Hip-Hop','R&B','Electronic','Jazz','Classical',
                'Country','Tamil','Hindi','Telugu','Malayalam','Kannada','Other'];

async function uploadToCloudinary(file, resourceType, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => xhr.status === 200
      ? resolve(JSON.parse(xhr.responseText).secure_url)
      : reject(new Error('Upload failed'));
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

const cls = (...c) => c.filter(Boolean).join(' ');

export default function AdminUpload() {
  const { currentUser, getAllUsers, updateUserRole } = useAuth();
  const { refreshSongs } = useMusic();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'PRIMARY_ADMIN';
  const isPrimary = currentUser?.role === 'PRIMARY_ADMIN';

  useEffect(() => {
    if (currentUser && !isAdmin) navigate('/');
  }, [currentUser, isAdmin, navigate]);

  if (!isAdmin) return null;

  const tabs = [
    { key: 'upload', label: 'Upload Song', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg> },
    { key: 'songs',  label: 'Manage Songs', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg> },
    ...(isPrimary ? [{ key: 'admins', label: 'Manage Admins', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg> }] : []),
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {isPrimary ? '👑 Primary Admin' : '🛡️ Admin'} — {currentUser.username}
          </p>
        </div>
        <button onClick={() => navigate('/')}
          className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Back to app
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={cls(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === t.key
                ? 'bg-violet-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            )}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {activeTab === 'upload' && <UploadTab currentUser={currentUser} refreshSongs={refreshSongs} />}
      {activeTab === 'songs'  && <SongsTab refreshSongs={refreshSongs} />}
      {activeTab === 'admins' && isPrimary && <AdminsTab getAllUsers={getAllUsers} updateUserRole={updateUserRole} currentUser={currentUser} />}
    </div>
  );
}

/* ── Upload Tab ─────────────────────────────────────────────────────── */
function UploadTab({ currentUser, refreshSongs }) {
  const [form, setForm] = useState({ title: '', artist: '', album: '', genre: 'Tamil', duration: '', actor: '', actress: '', singer: '' });
  const [audioFile,  setAudioFile]  = useState(null);
  const [coverFile,  setCoverFile]  = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [audioProgress, setAudioProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);

  const handleAudio = e => {
    const f = e.target.files[0]; if (!f) return;
    setAudioFile(f);
    const name = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setForm(p => ({ ...p, title: p.title || name }));
  };
  const handleCover = e => {
    const f = e.target.files[0];
    if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!audioFile) return toast.error('Please select an audio file.');
    setLoading(true);
    try {
      toast.loading('Uploading audio…', { id: 'upload' });
      const audioUrl = await uploadToCloudinary(audioFile, 'video', setAudioProgress);
      let coverUrl = '';
      if (coverFile) {
        toast.loading('Uploading cover art…', { id: 'upload' });
        coverUrl = await uploadToCloudinary(coverFile, 'image', setCoverProgress);
      }
      toast.loading('Saving to database…', { id: 'upload' });
      await api.post('/songs', {
        title:    form.title.trim(),
        artist:   form.artist.trim(),
        album:    form.album.trim() || 'Unknown Album',
        genre:    form.genre,
        duration: form.duration.trim(),
        actor:    form.actor.trim(),
        actress:  form.actress.trim(),
        singer:   form.singer.trim(),
        audioUrl, coverUrl,
      });
      toast.success(`"${form.title}" uploaded!`, { id: 'upload' });
      setRecent(p => [{ title: form.title, artist: form.artist, genre: form.genre, coverUrl, id: Date.now() }, ...p]);
      setForm({ title: '', artist: '', album: '', genre: 'Tamil', duration: '', actor: '', actress: '', singer: '' });
      setAudioFile(null); setCoverFile(null); setCoverPreview('');
      setAudioProgress(0); setCoverProgress(0);
      refreshSongs();
    } catch (err) {
      toast.error(err.message || 'Upload failed.', { id: 'upload' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-semibold text-white">Song Details</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Title *', name: 'title', placeholder: 'e.g. Blinding Lights' },
            { label: 'Artist *', name: 'artist', placeholder: 'e.g. The Weeknd' },
            { label: 'Album', name: 'album', placeholder: 'e.g. After Hours' },
            { label: 'Duration', name: 'duration', placeholder: 'e.g. 3:22' },
            { label: 'Actor', name: 'actor', placeholder: 'e.g. Vijay' },
            { label: 'Actress', name: 'actress', placeholder: 'e.g. Pooja Hegde' },
            { label: 'Singer', name: 'singer', placeholder: 'e.g. Anirudh' },
          ].map(({ label, name, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-medium text-zinc-400 mb-1">{label}</label>
              <input name={name} value={form[name]}
                onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none transition-colors" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Genre</label>
            <select name="genre" value={form.genre} onChange={e => setForm(p => ({ ...p, genre: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white outline-none">
              {GENRES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Audio dropzone */}
        <label className={cls('flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
          audioFile ? 'border-violet-500 bg-violet-500/10' : 'border-zinc-700 hover:border-zinc-600')}>
          <input type="file" accept="audio/*" onChange={handleAudio} hidden />
          <svg viewBox="0 0 24 24" width="28" height="28" fill={audioFile ? '#8b5cf6' : '#52525b'}>
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
          </svg>
          <span className="text-sm font-medium text-zinc-300">
            {audioFile ? audioFile.name : 'Click to select audio file'}
          </span>
          {audioFile && <span className="text-xs text-zinc-500">{(audioFile.size/(1024*1024)).toFixed(1)} MB</span>}
          {audioProgress > 0 && audioProgress < 100 && (
            <div className="w-full bg-zinc-700 rounded-full h-1.5 mt-1">
              <div className="bg-violet-500 h-1.5 rounded-full transition-all" style={{ width: `${audioProgress}%` }} />
            </div>
          )}
        </label>

        {/* Cover dropzone */}
        <label className={cls('flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
          coverFile ? 'border-violet-500' : 'border-zinc-700 hover:border-zinc-600')}>
          <input type="file" accept="image/*" onChange={handleCover} hidden />
          {coverPreview
            ? <img src={coverPreview} alt="preview" className="w-24 h-24 rounded-xl object-cover" />
            : <>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="#52525b">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
                <span className="text-sm text-zinc-500">Cover art (optional)</span>
              </>
          }
        </label>

        <button type="submit" disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</>
            : <><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg> Upload Song</>
          }
        </button>
      </form>

      {/* Recently uploaded */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Recently Uploaded</h2>
        {recent.length === 0
          ? <p className="text-zinc-500 text-sm">Songs you upload will appear here.</p>
          : <div className="space-y-2">
              {recent.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                  <img src={s.coverUrl || `https://picsum.photos/seed/${s.id}/40/40`} alt={s.title}
                    className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{s.title}</p>
                    <p className="text-xs text-zinc-500 truncate">{s.artist} · {s.genre}</p>
                  </div>
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">✅ Live</span>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}

/* ── Songs Tab ───────────────────────────────────────────────────────── */
function SongsTab({ refreshSongs }) {
  const [songs, setSongs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/songs');
      setSongs(data);
    } catch { toast.error('Failed to load songs.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSongs(); }, [fetchSongs]);

  const handleDelete = async song => {
    if (!window.confirm(`Delete "${song.title}"? This cannot be undone.`)) return;
    setDeleting(song.id);
    try {
      await api.delete(`/songs/${song.id}`);
      setSongs(p => p.filter(s => s.id !== song.id));
      toast.success(`Deleted "${song.title}"`);
      refreshSongs();
    } catch { toast.error('Failed to delete.'); }
    finally { setDeleting(null); }
  };

  const filtered = songs.filter(s =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.artist?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-zinc-500">{songs.length} songs in library</span>
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            className="bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition-colors w-48" />
          <button onClick={fetchSongs} title="Refresh"
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition-colors">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-8">No songs found.</p>
      ) : (
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-3 px-3 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-white/5">
            <span>#</span><span>Title</span><span>Artist</span><span>Genre</span><span>Duration</span><span></span>
          </div>
          {filtered.map((s, i) => (
            <div key={s.id}
              className={cls('grid grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-3 items-center px-3 py-2.5 rounded-xl transition-colors hover:bg-white/5 group',
                deleting === s.id && 'opacity-40')}>
              <span className="text-xs text-zinc-600 w-5 text-center">{i + 1}</span>
              <div className="flex items-center gap-2 min-w-0">
                <img src={s.coverUrl || `https://picsum.photos/seed/${s.id}/32/32`} alt={s.title}
                  className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                <span className="text-sm text-white truncate">{s.title}</span>
              </div>
              <span className="text-sm text-zinc-400 truncate">{s.artist}</span>
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{s.genre}</span>
              <span className="text-xs text-zinc-500">{s.duration || '—'}</span>
              <button onClick={() => handleDelete(s)} disabled={deleting === s.id}
                className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1">
                {deleting === s.id
                  ? <span className="w-3.5 h-3.5 border border-zinc-500 border-t-transparent rounded-full animate-spin block" />
                  : <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Admins Tab ──────────────────────────────────────────────────────── */
function AdminsTab({ getAllUsers, updateUserRole, currentUser }) {
  const [users, setUsers]     = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const data = await getAllUsers();
    setUsers(data);
  }, [getAllUsers]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCreate = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      const { data } = await api.get('/users');
      const newUser = data.find(u => u.username === form.username);
      if (newUser) await api.patch(`/users/${newUser.id}/role`, { role: 'ADMIN' });
      toast.success(`Admin "${form.username}" created!`);
      setForm({ username: '', password: '' });
      setShowForm(false);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create admin.');
    } finally { setLoading(false); }
  };

  const handleGrant = async userId => {
    try { await updateUserRole(userId, 'ADMIN'); toast.success('Admin granted.'); refresh(); }
    catch { toast.error('Failed.'); }
  };
  const handleRevoke = async userId => {
    try { await updateUserRole(userId, 'USER'); toast.success('Admin revoked.'); refresh(); }
    catch { toast.error('Failed.'); }
  };

  return (
    <div className="space-y-4">
      {/* Create admin */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Admin Users</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Admins can upload and delete songs.</p>
          </div>
          <button onClick={() => setShowForm(v => !v)}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors">
            {showForm ? '✕ Cancel' : '+ Create Admin'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="flex gap-3">
            <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              placeholder="Username" required
              className="flex-1 bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-600 outline-none transition-colors" />
            <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Password (min 6)" required
              className="flex-1 bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-600 outline-none transition-colors" />
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors">
              {loading ? 'Creating…' : 'Create'}
            </button>
          </form>
        )}
      </div>

      {/* Users list */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">All Users ({users.length})</h2>
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
              <img src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`}
                alt={u.username} className="w-9 h-9 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{u.username}</span>
                  {u.role === 'PRIMARY_ADMIN' && <span className="text-xs bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">👑 Primary Admin</span>}
                  {u.role === 'ADMIN' && <span className="text-xs bg-violet-500/15 text-violet-400 px-2 py-0.5 rounded-full">🛡️ Admin</span>}
                </div>
                <p className="text-xs text-zinc-500">
                  Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </p>
              </div>
              {u.role !== 'PRIMARY_ADMIN' && u.id !== currentUser.id && (
                u.role === 'ADMIN'
                  ? <button onClick={() => handleRevoke(u.id)}
                      className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 rounded-lg transition-colors">
                      Revoke Admin
                    </button>
                  : <button onClick={() => handleGrant(u.id)}
                      className="text-xs px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 rounded-lg transition-colors">
                      Grant Admin
                    </button>
              )}
              {(u.role === 'PRIMARY_ADMIN' || u.id === currentUser.id) && (
                <span className="text-xs text-zinc-600">You</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
