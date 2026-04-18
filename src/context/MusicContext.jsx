import {
  createContext, useContext, useState, useCallback,
  useEffect, useRef,
} from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { demoSongs } from '../data/demoSongs';

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  // Songs catalog
  // If Firebase isn't configured, use demo songs immediately (no spinner)
  const [songs,         setSongs]        = useState(isFirebaseConfigured ? [] : demoSongs);
  const [isLoadingSongs,setIsLoadingSongs]= useState(isFirebaseConfigured);

  // Playback state
  const [currentSong,  setCurrentSong]  = useState(null);
  const [queue,        setQueue]        = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isShuffled,   setIsShuffled]   = useState(false);
  const [repeatMode,   setRepeatMode]   = useState('off'); // 'off' | 'one' | 'all'

  // Shuffle map
  const shuffleMapRef = useRef([]);

  const player = useAudioPlayer();

  // ── Load songs ────────────────────────────────────────────────────────
  useEffect(() => {
    // Only fetch from Firebase if configured — otherwise demo songs are already set
    if (!isFirebaseConfigured) return;

    const loadSongs = async () => {
      setIsLoadingSongs(true);
      try {
        const q = query(collection(db, 'songs'), orderBy('title'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSongs(data.length ? data : demoSongs);
      } catch (err) {
        console.error('Firebase fetch error:', err.message);
        setSongs(demoSongs);
      } finally {
        setIsLoadingSongs(false); // always runs
      }
    };

    loadSongs();
  }, []);

  // ── Auto-advance on song end ─────────────────────────────────────────
  useEffect(() => {
    const cleanup = player.onEnded(() => {
      if (repeatMode === 'one') {
        player.seek(0);
        player.play();
      } else {
        handleNext();
      }
    });
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeatMode, currentIndex, queue, isShuffled]);

  // ── Core play function ───────────────────────────────────────────────
  const playSong = useCallback((song, queueList = null, index = null) => {
    const newQueue = queueList || songs;
    const newIndex = index !== null
      ? index
      : newQueue.findIndex(s => s.id === song.id);

    setQueue(newQueue);
    setCurrentIndex(newIndex >= 0 ? newIndex : 0);
    setCurrentSong(song);
    player.loadSong(song.audio_url);
    // Small delay to let the browser load
    setTimeout(() => player.play(), 100);
  }, [songs, player]);

  // ── Navigation ────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (queue.length === 0) return;

    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') nextIndex = 0;
        else return; // end of queue
      }
    }
    const nextSong = queue[nextIndex];
    setCurrentIndex(nextIndex);
    setCurrentSong(nextSong);
    player.loadSong(nextSong.audio_url);
    setTimeout(() => player.play(), 100);
  }, [queue, currentIndex, isShuffled, repeatMode, player]);

  const handlePrev = useCallback(() => {
    if (queue.length === 0) return;
    // If > 3s into song, restart it
    if (player.currentTime > 3) {
      player.seek(0);
      return;
    }
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === 'all') prevIndex = queue.length - 1;
      else return;
    }
    const prevSong = queue[prevIndex];
    setCurrentIndex(prevIndex);
    setCurrentSong(prevSong);
    player.loadSong(prevSong.audio_url);
    setTimeout(() => player.play(), 100);
  }, [queue, currentIndex, player, repeatMode]);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => !prev);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const playPlaylist = useCallback((playlist, startIndex = 0) => {
    if (!playlist.songs?.length) return;
    const song = playlist.songs[startIndex];
    playSong(song, playlist.songs, startIndex);
  }, [playSong]);

  return (
    <MusicContext.Provider value={{
      // Songs
      songs,
      isLoadingSongs,
      // Playback
      currentSong,
      queue,
      currentIndex,
      isShuffled,
      repeatMode,
      // Player controls (from hook)
      ...player,
      // Actions
      playSong,
      handleNext,
      handlePrev,
      toggleShuffle,
      cycleRepeat,
      playPlaylist,
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
