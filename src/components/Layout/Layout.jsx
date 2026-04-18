import Sidebar from '../Sidebar/Sidebar';
import Player from '../Player/Player';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        {children}
      </main>
      <Player />
    </div>
  );
}
