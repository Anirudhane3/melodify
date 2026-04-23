import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import SongList from '../components/SongList/SongList';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function PlaylistsPage() {
  const { currentUser } = useAuth();
  const { songs, playPlaylist } = useMusic();
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlists, setPlaylists]     = useState([]);
  const [selected,  setSelected]      = useState(null);
  const [newName,   setNewName]       = useState('');
  const [creating,  setCreating]      = useState(false);
  const [loading,   setLoading]       = useState(true);

  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/playlists');
      setPlaylists(data);
      if (id) {
        const found = data.find(p => String(p.id) === id);
        if (found) setSelected(found);
      }
    } catch { toast.error('Failed to load playlists.'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchPlaylists(); }, [fetchPlaylists]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const { data } = await api.post('/playlists', { name: newName.trim() });
      setPlaylists(p => [data, ...p]);
      setNewName('');
      setCreating(false);
      toast.success('Playlist created!');
    } catch { toast.error('Failed to create playlist.'); }
  };

  const handleDelete = async (playlist) => {
    if (!window.confirm(`Delete "${playlist.name}"?`)) return;
    try {
      await api.delete(`/playlists/${playlist.id}`);
      setPlaylists(p => p.filter(x => x.id !== playlist.id));
      if (selected?.id === playlist.id) setSelected(null);
      toast.success('Playlist deleted.');
    } catch { toast.error('Failed to delete.'); }
  };

  const handleAddSong = async (playlist, song) => {
    try {
      const { data } = await api.post(`/playlists/${playlist.id}/songs`, { songId: song.id });
      setPlaylists(p => p.map(x => x.id === data.id ? data : x));
      if (selected?.id === data.id) setSelected(data);
      toast.success(`Added "${song.title}"`);
    } catch { toast.error('Already in playlist or error.'); }
  };

  const handleRemoveSong = async (songId) => {
    if (!selected) return;
    try {
      const { data } = await api.delete(`/playlists/${selected.id}/songs/${songId}`);
      setPlaylists(p => p.map(x => x.id === data.id ? data : x));
      setSelected(data);
    } catch { toast.error('Failed to remove song.'); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Playlists</h1>
        <button onClick={() => setCreating(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors">
          {creating ? '✕ Cancel' : '+ New Playlist'}
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="flex gap-2 mb-6">
          <input value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Playlist name…" required
            className="flex-1 bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-500 outline-none transition-colors" />
          <button type="submit"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors">
            Create
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Playlist list */}
          <div className="space-y-2">
            {playlists.length === 0 && (
              <p className="text-zinc-500 text-sm">No playlists yet.</p>
            )}
            {playlists.map(p => (
              <div key={p.id}
                onClick={() => { setSelected(p); navigate(`/playlists/${p.id}`); }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group
                  ${selected?.id === p.id ? 'bg-violet-600/20 ring-1 ring-violet-500/30' : 'hover:bg-white/5'}`}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                    <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.songs?.length ?? 0} songs</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(p); }}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all p-1">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Selected playlist detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">{selected.name}</h2>
                    <p className="text-xs text-zinc-500">{selected.songs?.length ?? 0} songs</p>
                  </div>
                  {selected.songs?.length > 0 && (
                    <button onClick={() => playPlaylist(selected)}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      Play All
                    </button>
                  )}
                </div>

                {/* Playlist songs */}
                {selected.songs?.length === 0
                  ? <p className="text-zinc-500 text-sm">Add songs from the list below.</p>
                  : <div className="space-y-1 mb-6">
                      {selected.songs.map(s => (
                        <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 group">
                          <img src={s.coverUrl || s.cover_url || `https://picsum.photos/seed/${s.id}/32/32`}
                            alt={s.title} className="w-8 h-8 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{s.title}</p>
                            <p className="text-xs text-zinc-500 truncate">{s.artist}</p>
                          </div>
                          <button onClick={() => handleRemoveSong(s.id)}
                            className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all p-1">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                }

                {/* Add from library */}
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Add from Library</p>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {songs.filter(s => !selected.songs?.find(x => String(x.id) === String(s.id))).map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 group cursor-pointer"
                      onClick={() => handleAddSong(selected, s)}>
                      <img src={s.cover_url || s.coverUrl || `https://picsum.photos/seed/${s.id}/32/32`}
                        alt={s.title} className="w-8 h-8 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{s.title}</p>
                        <p className="text-xs text-zinc-500 truncate">{s.artist}</p>
                      </div>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"
                        className="text-zinc-600 group-hover:text-violet-400 transition-colors">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-zinc-900/30 rounded-2xl border border-white/5">
                <p className="text-zinc-500 text-sm">Select a playlist to view it</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
