import Sidebar from '../Sidebar/Sidebar';
import Player from '../Player/Player';
import { useMusic } from '../../context/MusicContext';

export default function Layout({ children }) {
  const { currentSong } = useMusic();
  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        <main className={`flex-1 overflow-y-auto ${currentSong ? 'pb-28' : ''}`}>
          {children}
        </main>

        {/* Player bar */}
        {currentSong && (
          <div className="fixed bottom-0 left-0 right-0 z-50">
            <Player />
          </div>
        )}
      </div>
    </div>
  );
}
