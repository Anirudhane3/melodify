import { useMusic } from '../context/MusicContext';
import SongList from '../components/SongList/SongList';

export default function Home() {
  const { songs, playSong, isLoadingSongs } = useMusic();
  const featured = songs.slice(0, 5);

  if (isLoadingSongs) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Hero */}
      {featured.length > 0 && (
        <section className="relative h-56 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${featured[0]?.cover_url || featured[0]?.coverUrl || ''})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Featured Track</span>
            <h1 className="text-3xl font-bold text-white mt-1">{featured[0]?.title}</h1>
            <p className="text-zinc-400 text-sm mt-0.5">{featured[0]?.artist} · {featured[0]?.album}</p>
            <button
              onClick={() => playSong(featured[0], songs, 0)}
              className="mt-3 flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-sm font-semibold rounded-full transition-all shadow-lg shadow-violet-900/30"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Play Now
            </button>
          </div>
        </section>
      )}

      {/* Quick Picks */}
      {featured.length > 1 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-3">Quick Picks</h2>
          <div className="grid grid-cols-2 gap-2">
            {featured.slice(1).map((song, i) => {
              const cover = song.cover_url || song.coverUrl
                || `https://picsum.photos/seed/${song.id}/56/56`;
              return (
                <button key={song.id} onClick={() => playSong(song, songs, i + 1)}
                  className="flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl text-left transition-all group">
                  <img src={cover} alt={song.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{song.title}</p>
                    <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Full list */}
      <section>
        <SongList songs={songs} title="All Songs" showSearch={true} />
      </section>
    </div>
  );
}
