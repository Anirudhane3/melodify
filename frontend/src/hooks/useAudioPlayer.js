import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioPlayer() {
  const audioRef  = useRef(new Audio());
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);
  const [volume,      setVolume]      = useState(1);
  const [isMuted,     setIsMuted]     = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    const onTime   = () => setCurrentTime(audio.currentTime);
    const onLoad   = () => setDuration(audio.duration);
    const onPlay   = () => setIsPlaying(true);
    const onPause  = () => setIsPlaying(false);
    audio.addEventListener('timeupdate',       onTime);
    audio.addEventListener('loadedmetadata',   onLoad);
    audio.addEventListener('play',             onPlay);
    audio.addEventListener('pause',            onPause);
    return () => {
      audio.removeEventListener('timeupdate',     onTime);
      audio.removeEventListener('loadedmetadata', onLoad);
      audio.removeEventListener('play',           onPlay);
      audio.removeEventListener('pause',          onPause);
    };
  }, []);

  const loadSong = useCallback((url) => {
    audioRef.current.src = url;
    audioRef.current.load();
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const play  = useCallback(() => audioRef.current.play().catch(() => {}), []);
  const pause = useCallback(() => audioRef.current.pause(), []);
  const togglePlay = useCallback(() => {
    if (audioRef.current.paused) play(); else pause();
  }, [play, pause]);

  const seek = useCallback((t) => { audioRef.current.currentTime = t; }, []);

  const changeVolume = useCallback((v) => {
    audioRef.current.volume = v;
    setVolume(v);
    setIsMuted(v === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !isMuted;
    audioRef.current.muted = next;
    setIsMuted(next);
  }, [isMuted]);

  const onEnded = useCallback((cb) => {
    const audio = audioRef.current;
    audio.addEventListener('ended', cb);
    return () => audio.removeEventListener('ended', cb);
  }, []);

  return {
    isPlaying, currentTime, duration, volume, isMuted,
    play, pause, togglePlay, seek, changeVolume, toggleMute,
    loadSong, onEnded,
  };
}
