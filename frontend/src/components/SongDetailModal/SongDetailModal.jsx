import { useMusic } from '../../context/MusicContext';
import { useEffect } from 'react';

export default function SongDetailModal({ song, onClose }) {
  const { playSong, currentSong, isPlaying, togglePlay } = useMusic();
  const isActive = currentSong?.id === song.id;
  const cover = song.cover_url || song.coverUrl
    || `https://picsum.photos/seed/${song.id}/300/300`;

  // Close on Escape key
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handlePlay = () => {
    if (isActive) togglePlay();
    else playSong(song, [song], 0);
  };

  const rows = [
    { label: 'Album',   value: song.album },
    { label: 'Genre',   value: song.genre },
    { label: 'Singer',  value: song.singer },
    { label: 'Actor',   value: song.actor },
    { label: 'Actress', value: song.actress },
    { label: 'Duration',value: song.duration },
    { label: 'Uploaded by', value: song.uploadedBy },
  ].filter(r => r.value);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Cover banner */}
        <div className="relative h-48">
          <img src={cover} alt={song.title}
            className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Details */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-white truncate">{song.title}</h3>
              <p className="text-sm text-zinc-400 truncate mt-0.5">{song.artist}</p>
            </div>
            <button
              onClick={handlePlay}
              className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-violet-600 hover:bg-violet-500 rounded-full transition-all shadow-lg shadow-violet-900/40 active:scale-95"
            >
              {isActive && isPlaying
                ? <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                : <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M8 5v14l11-7z"/></svg>
              }
            </button>
          </div>

          {/* Info rows */}
          <div className="space-y-2.5">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex items-baseline gap-2">
                <span className="text-xs font-medium text-zinc-500 w-20 flex-shrink-0">{label}</span>
                <span className="text-sm text-zinc-200 flex-1">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
