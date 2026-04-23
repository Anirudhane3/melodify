import { useMusic } from '../../context/MusicContext';

function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function Player() {
  const {
    currentSong, isPlaying, currentTime, duration, volume, isMuted,
    togglePlay, seek, changeVolume, toggleMute,
    handleNext, handlePrev, isShuffled, repeatMode, toggleShuffle, cycleRepeat,
  } = useMusic();

  if (!currentSong) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const cover = currentSong.cover_url || currentSong.coverUrl
    || `https://picsum.photos/seed/${currentSong.id}/56/56`;

  return (
    <div className="h-20 bg-zinc-900/95 backdrop-blur-xl border-t border-white/5 flex items-center px-4 gap-4">

      {/* Song info */}
      <div className="flex items-center gap-3 w-56 flex-shrink-0">
        <img src={cover} alt={currentSong.title}
          className="w-12 h-12 rounded-lg object-cover shadow-lg flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{currentSong.title}</p>
          <p className="text-xs text-zinc-400 truncate">{currentSong.artist}</p>
        </div>
      </div>

      {/* Controls + Scrubber */}
      <div className="flex-1 flex flex-col items-center gap-1.5 px-4">
        {/* Buttons */}
        <div className="flex items-center gap-4">
          <IconBtn onClick={toggleShuffle} active={isShuffled} title="Shuffle">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
            </svg>
          </IconBtn>

          <IconBtn onClick={handlePrev} title="Previous">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
            </svg>
          </IconBtn>

          <button onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg">
            {isPlaying
              ? <svg viewBox="0 0 24 24" width="20" height="20" fill="#09090b"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              : <svg viewBox="0 0 24 24" width="20" height="20" fill="#09090b"><path d="M8 5v14l11-7z"/></svg>
            }
          </button>

          <IconBtn onClick={handleNext} title="Next">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
            </svg>
          </IconBtn>

          <IconBtn onClick={cycleRepeat} active={repeatMode !== 'off'} title={`Repeat: ${repeatMode}`}>
            {repeatMode === 'one'
              ? <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>
              : <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
            }
          </IconBtn>
        </div>

        {/* Scrubber */}
        <div className="flex items-center gap-2 w-full max-w-lg">
          <span className="text-xs text-zinc-500 w-8 text-right">{fmt(currentTime)}</span>
          <div className="flex-1 relative h-1 group">
            <div className="absolute inset-0 rounded-full bg-zinc-700" />
            <div className="absolute inset-y-0 left-0 rounded-full bg-violet-500 transition-all"
              style={{ width: `${progress}%` }} />
            <input type="range" min="0" max={duration || 0} step="0.5" value={currentTime}
              onChange={e => seek(+e.target.value)}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
          </div>
          <span className="text-xs text-zinc-500 w-8">{fmt(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 w-32 flex-shrink-0">
        <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition-colors">
          {isMuted || volume === 0
            ? <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 19 7.95 7.95 0 0 0 19 17.73L20.73 19.46 22 18.19l-18-18zM12 4L9.91 6.09 12 8.18V4z"/></svg>
            : <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
          }
        </button>
        <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume}
          onChange={e => changeVolume(+e.target.value)}
          className="flex-1 accent-violet-500 cursor-pointer" />
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, active, title }) {
  return (
    <button onClick={onClick} title={title}
      className={`transition-colors ${active ? 'text-violet-400' : 'text-zinc-400 hover:text-white'}`}>
      {children}
    </button>
  );
}
