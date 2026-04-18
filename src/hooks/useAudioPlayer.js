import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * useAudioPlayer — wraps HTML5 Audio API
 * Uses a stable ref for the Audio instance so it survives re-renders.
 */
export function useAudioPlayer() {
  const audioRef = useRef(null);

  // Initialise audio instance once
  if (!audioRef.current) {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.8;
    audioRef.current.preload = 'metadata';
  }

  const [isPlaying,  setIsPlaying]  = useState(false);
  const [progress,   setProgress]   = useState(0);       // 0 – 100
  const [duration,   setDuration]   = useState(0);       // seconds
  const [currentTime,setCurrentTime]= useState(0);       // seconds
  const [volume,     setVolumeState]= useState(0.8);     // 0 – 1
  const [isMuted,    setIsMuted]    = useState(false);
  const [isLoading,  setIsLoading]  = useState(false);

  // ── Wire up audio events ────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      const cur = audio.currentTime;
      const dur = audio.duration || 0;
      setCurrentTime(cur);
      setProgress(dur > 0 ? (cur / dur) * 100 : 0);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const onWaiting  = () => setIsLoading(true);
    const onCanPlay  = () => setIsLoading(false);
    const onError    = () => setIsLoading(false); // bad/missing URL — stop spinner
    const onPlay     = () => setIsPlaying(true);
    const onPause    = () => setIsPlaying(false);
    const onEnded    = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate',    onTimeUpdate);
    audio.addEventListener('loadedmetadata',onLoadedMetadata);
    audio.addEventListener('waiting',       onWaiting);
    audio.addEventListener('canplay',       onCanPlay);
    audio.addEventListener('error',         onError);
    audio.addEventListener('play',          onPlay);
    audio.addEventListener('pause',         onPause);
    audio.addEventListener('ended',         onEnded);

    return () => {
      audio.removeEventListener('timeupdate',    onTimeUpdate);
      audio.removeEventListener('loadedmetadata',onLoadedMetadata);
      audio.removeEventListener('waiting',       onWaiting);
      audio.removeEventListener('canplay',       onCanPlay);
      audio.removeEventListener('error',         onError);
      audio.removeEventListener('play',          onPlay);
      audio.removeEventListener('pause',         onPause);
      audio.removeEventListener('ended',         onEnded);
    };
  }, []);

  // ── Controls ────────────────────────────────────────────────────────────
  const loadSong = useCallback((url) => {
    const audio = audioRef.current;
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    if (!url) {
      // No audio URL — don't try to load, don't show spinner
      audio.src = '';
      setIsLoading(false);
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    audio.src = url;
    audio.load();
  }, []);

  const play = useCallback(async () => {
    try {
      await audioRef.current.play();
    } catch (err) {
      console.warn('Playback error:', err);
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (audioRef.current.paused) play();
    else pause();
  }, [play, pause]);

  const seek = useCallback((percent) => {
    const audio = audioRef.current;
    if (!audio.duration) return;
    audio.currentTime = (percent / 100) * audio.duration;
    setProgress(percent);
  }, []);

  const seekSeconds = useCallback((seconds) => {
    const audio = audioRef.current;
    if (!audio.duration) return;
    const clamped = Math.max(0, Math.min(seconds, audio.duration));
    audio.currentTime = clamped;
  }, []);

  const setVolume = useCallback((val) => {
    const clamped = Math.max(0, Math.min(1, val));
    audioRef.current.volume = clamped;
    setVolumeState(clamped);
    if (clamped > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }, []);

  /** Returns the "ended" event: true when current track finished */
  const onEnded = useCallback((cb) => {
    audioRef.current.addEventListener('ended', cb);
    return () => audioRef.current.removeEventListener('ended', cb);
  }, []);

  return {
    audioRef,
    isPlaying,
    progress,
    duration,
    currentTime,
    volume,
    isMuted,
    isLoading,
    loadSong,
    play,
    pause,
    togglePlay,
    seek,
    seekSeconds,
    setVolume,
    toggleMute,
    stop,
    onEnded,
  };
}

/** Format seconds → "m:ss" */
export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
