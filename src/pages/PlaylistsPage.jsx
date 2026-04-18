import { useParams } from 'react-router-dom';
import PlaylistPanel from '../components/Playlist/PlaylistPanel';
import '../components/Playlist/Playlist.css';

export default function PlaylistsPage() {
  const { id } = useParams();
  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      <PlaylistPanel activePlaylistId={id || null} />
    </div>
  );
}
