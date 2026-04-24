import { useMusic } from '../../context/MusicContext';
import { useState } from 'react';
import SongDetailModal from '../SongDetailModal/SongDetailModal';

export default function SongCard({ song, queueList, index }) {
  const { currentSong, isPlaying, playSong, togglePlay } = useMusic();
  const isActive = currentSong?.id === song.id;
  const cover = song.cover_url || song.coverUrl
    || `https://picsum.photos/seed/${song.id}/56/56`;
  const [showDetail, setShowDetail] = useState(false);

  const handleClick = () => {
    if (isActive) togglePlay();
    else playSong(song, queueList, index);
  };

  // Build labeled artist line from individual fields if available
  const artistParts = [];
  if (song.singer)  artistParts.push({ label: 'Singer',  value: song.singer });
  if (song.actor)   artistParts.push({ label: 'Actor',   value: song.actor });
  if (song.actress) artistParts.push({ label: 'Actress', value: song.actress });
  const hasRoles = artistParts.length > 0;

  return (
    <>
      <div
        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 group
          ${isActive ? 'bg-violet-600/15 ring-1 ring-violet-500/30' : 'hover:bg-white/5'}`}
      >
        {/* Cover / play icon overlay */}
        <div className="relative w-10 h-10 flex-shrink-0" onClick={handleClick}>
          <img src={cover} alt={song.title}
            className="w-10 h-10 rounded-lg object-cover" />
          <div className={`absolute inset-0 rounded-lg flex items-center justify-center bg-black/50
            transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            {isActive && isPlaying
              ? <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              : <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M8 5v14l11-7z"/></svg>
            }
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0" onClick={handleClick}>
          <p className={`text-sm font-medium truncate ${isActive ? 'text-violet-400' : 'text-white'}`}>
            {song.title}
          </p>

          {hasRoles ? (
            <p className="text-xs text-zinc-500 truncate">
              {artistParts.map((p, i) => (
                <span key={p.label}>
                  <span className="text-zinc-600">{p.label}: </span>
                  <span>{p.value}</span>
                  {i < artistParts.length - 1 && <span className="text-zinc-700"> · </span>}
                </span>
              ))}
            </p>
          ) : (
            <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
          )}
        </div>

        {/* Right side: genre + duration + info button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {song.genre && (
            <span className="hidden sm:inline text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">
              {song.genre}
            </span>
          )}
          {song.duration && (
            <span className="text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors" onClick={handleClick}>
              {song.duration}
            </span>
          )}
          {/* Info button */}
          <button
            onClick={e => { e.stopPropagation(); setShowDetail(true); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-500 hover:text-violet-400"
            title="Song details"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </button>
        </div>
      </div>

      {showDetail && (
        <SongDetailModal song={song} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}
