import { useMusic } from '../context/MusicContext';
import SongList from '../components/SongList/SongList';
import './Home.css';

export default function Home() {
  const { songs, playSong, isLoadingSongs } = useMusic();

  // Featured = first 5 songs
  const featured = songs.slice(0, 5);

  return (
    <div className="page-container home-page">
      {/* ── Hero Banner ── */}
      {!isLoadingSongs && featured.length > 0 && (
        <section className="home-hero">
          <div className="home-hero-bg"
            style={{ backgroundImage: `url(${featured[0]?.cover_url || ''})` }}
          />
          <div className="home-hero-content">
            <span className="home-hero-label">Featured Track</span>
            <h1 className="home-hero-title">{featured[0]?.title}</h1>
            <p className="home-hero-artist">{featured[0]?.artist} · {featured[0]?.album}</p>
            <button className="btn btn-primary home-hero-play"
              onClick={() => playSong(featured[0], songs, 0)}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play Now
            </button>
          </div>
        </section>
      )}

      {/* ── Quick Pick row ── */}
      {!isLoadingSongs && featured.length > 1 && (
        <section className="home-section">
          <h2 className="section-title">Quick Picks</h2>
          <div className="home-quick-picks">
            {featured.slice(1).map((song, i) => (
              <button
                key={song.id}
                className="home-quick-card"
                onClick={() => playSong(song, songs, i + 1)}
              >
                <img
                  src={song.cover_url || `https://picsum.photos/seed/${song.id}/56/56`}
                  alt={song.title}
                  className="home-quick-cover"
                />
                <span className="home-quick-title truncate">{song.title}</span>
                <span className="home-quick-artist truncate">{song.artist}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Full Song List ── */}
      <section className="home-section">
        <SongList songs={songs} title="All Songs" showSearch={true} />
      </section>
    </div>
  );
}
