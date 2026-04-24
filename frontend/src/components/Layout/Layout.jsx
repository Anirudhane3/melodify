import Sidebar from '../Sidebar/Sidebar';
import BottomNav from '../BottomNav/BottomNav';
import Player from '../Player/Player';
import { useMusic } from '../../context/MusicContext';

export default function Layout({ children }) {
  const { currentSong } = useMusic();
  const playerHeight = currentSong ? 'pb-28' : '';

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar — hidden on mobile, visible on md+ */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        <main className={`flex-1 overflow-y-auto ${playerHeight} pb-16 md:pb-0`}>
          {children}
        </main>
      </div>

      {/* Player bar — fixed bottom, above bottom nav on mobile */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:left-0">
          <Player />
        </div>
      )}

      {/* Bottom nav — mobile only */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
