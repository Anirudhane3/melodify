import {
  createContext, useContext, useState, useCallback,
  useEffect, useRef,
} from 'react';
import api from '../lib/api';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { demoSongs } from '../data/demoSongs';

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const [songs,          setSongs]         = useState([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [currentSong,    setCurrentSong]   = useState(null);
  const [queue,          setQueue]         = useState([]);
  const [currentIndex,   setCurrentIndex]  = useState(-1);
  const [isShuffled,     setIsShuffled]    = useState(false);
  const [repeatMode,     setRepeatMode]    = useState('off');

  const player = useAudioPlayer();

  useEffect(() => {
    const loadSongs = async () => {
      setIsLoadingSongs(true);
      try {
        const { data } = await api.get('/songs');
        // map backend field names to frontend convention
        const mapped = data.map(s => ({ ...s, audio_url: s.audioUrl, cover_url: s.coverUrl }));
        setSongs(mapped.length ? mapped : demoSongs);
      } catch {
        setSongs(demoSongs);
      } finally {
        setIsLoadingSongs(false);
      }
    };
    loadSongs();
  }, []);

  useEffect(() => {
    const cleanup = player.onEnded(() => {
      if (repeatMode === 'one') { player.seek(0); player.play(); }
      else handleNext();
    });
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeatMode, currentIndex, queue, isShuffled]);

  const playSong = useCallback((song, queueList = null, index = null) => {
    const newQueue = queueList || songs;
    const newIndex = index !== null ? index : newQueue.findIndex(s => s.id === song.id);
    setQueue(newQueue);
    setCurrentIndex(newIndex >= 0 ? newIndex : 0);
    setCurrentSong(song);
    player.loadSong(song.audio_url || song.audioUrl);
    setTimeout(() => player.play(), 100);
  }, [songs, player]);

  const handleNext = useCallback(() => {
    if (!queue.length) return;
    let nextIndex = isShuffled ? Math.floor(Math.random() * queue.length) : currentIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') nextIndex = 0;
      else return;
    }
    const next = queue[nextIndex];
    setCurrentIndex(nextIndex);
    setCurrentSong(next);
    player.loadSong(next.audio_url || next.audioUrl);
    setTimeout(() => player.play(), 100);
  }, [queue, currentIndex, isShuffled, repeatMode, player]);

  const handlePrev = useCallback(() => {
    if (!queue.length) return;
    if (player.currentTime > 3) { player.seek(0); return; }
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === 'all') prevIndex = queue.length - 1;
      else return;
    }
    const prev = queue[prevIndex];
    setCurrentIndex(prevIndex);
    setCurrentSong(prev);
    player.loadSong(prev.audio_url || prev.audioUrl);
    setTimeout(() => player.play(), 100);
  }, [queue, currentIndex, player, repeatMode]);

  const toggleShuffle = useCallback(() => setIsShuffled(p => !p), []);
  const cycleRepeat   = useCallback(() => setRepeatMode(p =>
    p === 'off' ? 'all' : p === 'all' ? 'one' : 'off'), []);

  const playPlaylist = useCallback((playlist, startIndex = 0) => {
    if (!playlist.songs?.length) return;
    playSong(playlist.songs[startIndex], playlist.songs, startIndex);
  }, [playSong]);

  const refreshSongs = useCallback(async () => {
    const { data } = await api.get('/songs');
    const mapped = data.map(s => ({ ...s, audio_url: s.audioUrl, cover_url: s.coverUrl }));
    setSongs(mapped);
    return mapped;
  }, []);

  return (
    <MusicContext.Provider value={{
      songs, isLoadingSongs, refreshSongs,
      currentSong, queue, currentIndex, isShuffled, repeatMode,
      ...player,
      playSong, handleNext, handlePrev, toggleShuffle, cycleRepeat, playPlaylist,
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
}
