import { createContext, useContext, useMemo, useEffect, useRef, useState } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/libs/api";
import { getCachedUri, cacheTrackBackground, preloadOnWifi } from "@/utils/audioCache";

export interface TrackMeta {
  id: string;
  title: string;
  creatorName: string;
  creatorId?: string;
  thumbnail: string | null;
  creatorAvatar: string | null;
  masterUrl: string;
  downloadUrl?: string | null; // packaged MP3 from backend; preferred over HLS masterUrl
  localUri?: string;           // user-downloaded file; highest priority
  durationSeconds?: number;
}

interface AudioContextValue {
  player: ReturnType<typeof useAudioPlayer>;
  status: ReturnType<typeof useAudioPlayerStatus>;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seekBy: (seconds: number) => void;
  rate: number;
  setRate: (value: number) => void;
  isActive: boolean;
  currentTrack: TrackMeta | null;
  loadTrack: (track: TrackMeta) => Promise<void>;
  // queue
  queue: TrackMeta[];
  shuffle: boolean;
  toggleShuffle: () => void;
  loadPlaylist: (tracks: TrackMeta[], startIndex?: number) => Promise<void>;
  skipToNext: () => void;
  addToQueue: (track: TrackMeta) => void;
}

const AudioPlayerContext = createContext<AudioContextValue | null>(null);

export function AudioPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const isActive =
  status.duration > 0 && (status.playing || status.currentTime > 0);
  const [rate, setRateState] = useState(1);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<TrackMeta | null>(null);
  const [queue, setQueue] = useState<TrackMeta[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const queueRef = useRef<TrackMeta[]>([]);   // stable ref so effects read latest queue
  const prevPlayingRef = useRef(false);
  const currentTimeRef = useRef(0); // stable ref for use inside intervals

  // Load playback rate from storage
  useEffect(() => {
    const loadPlaybackRate = async () => {
      try {
        const savedRate = await AsyncStorage.getItem("playback_rate");
        if (savedRate) {
          const r = Number(savedRate);
          if (!Number.isNaN(r) && r > 0) {
            setRateState(r);
            // Only set playback rate if player is ready
            if (player && status.duration > 0) {
              await player.setPlaybackRate(r);
            }
          }
        }
        setIsPlayerReady(true);
      } catch (error) {
        console.error("Error loading playback rate:", error);
        setIsPlayerReady(true);
      }
    };

    loadPlaybackRate();
  }, []);

  // Set playback rate when player is ready and rate changes
  useEffect(() => {
    if (isPlayerReady && player && rate > 0) {
      try {
        player.setPlaybackRate(rate);
      } catch (error) {
        console.warn("Failed to set playback rate:", error);
      }
    }
  }, [rate, isPlayerReady, player]);

  const setRate = async (value: number) => {
    if (value <= 0) return;

    setRateState(value);

    try {
      if (player) {
        await player.setPlaybackRate(value);
      }
      await AsyncStorage.setItem("playback_rate", String(value));
    } catch (error) {
      console.error("Error setting playback rate:", error);
    }
  };

  // Keep a stable ref of currentTime so the interval can read it without deps
  useEffect(() => {
    currentTimeRef.current = status.currentTime;
  }, [status.currentTime]);

  // Report progress every 15s while playing, and once on pause
  useEffect(() => {
    if (!currentTrack || !status.playing) return;

    const report = () => {
      const secs = Math.floor(currentTimeRef.current);
      if (secs > 0) {
        api.post(`streams/${currentTrack.id}/progress`, { progress_seconds: secs }).catch(() => {});
      }
    };

    const interval = setInterval(report, 15_000);
    return () => {
      clearInterval(interval);
      report(); // flush on pause/unmount
    };
  }, [currentTrack?.id, status.playing]);

  // Keep queueRef in sync
  useEffect(() => { queueRef.current = queue; }, [queue]);

  // Auto-advance when track ends naturally
  useEffect(() => {
    const justStopped = prevPlayingRef.current && !status.playing;
    prevPlayingRef.current = status.playing;
    if (
      justStopped &&
      status.duration > 0 &&
      status.currentTime >= status.duration - 1.5 &&
      queueRef.current.length > 0
    ) {
      const [next, ...rest] = queueRef.current;
      queueRef.current = rest;
      setQueue(rest);
      loadTrack(next);
    }
  }, [status.playing]);

  const loadTrack = async (track: TrackMeta) => {
    // Save progress for the track we're leaving
    if (currentTrack && currentTimeRef.current > 0) {
      api.post(`streams/${currentTrack.id}/progress`, {
        progress_seconds: Math.floor(currentTimeRef.current),
      }).catch(() => {});
    }

    // Prefer: user-downloaded file > cached file > packaged MP3 > HLS stream
    const cachedUri = track.localUri ? null : await getCachedUri(track.id);
    const playUri = track.localUri ?? cachedUri ?? track.downloadUrl ?? track.masterUrl;

    setCurrentTrack({ ...track, localUri: track.localUri ?? cachedUri ?? undefined });
    try {
      player.replace({ uri: playUri });
      player.play();
    } catch (err) {
      console.error("[loadTrack] player error:", err);
    }

    // Cache in background after starting — no await, non-blocking
    if (track.downloadUrl && !track.localUri && !cachedUri) {
      cacheTrackBackground(track.id, track.downloadUrl).catch(() => {});
    }

    // Preload next queued track while this one plays
    const nextTrack = queueRef.current[0];
    if (nextTrack?.downloadUrl && !nextTrack.localUri) {
      preloadOnWifi(nextTrack.id, nextTrack.downloadUrl).catch(() => {});
    }
  };

  const loadPlaylist = async (tracks: TrackMeta[], startIndex = 0) => {
    if (!tracks.length) return;
    let ordered = [...tracks];
    if (shuffle) {
      for (let i = ordered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
      }
      startIndex = 0;
    }
    const rest = [...ordered.slice(0, startIndex), ...ordered.slice(startIndex + 1)];
    setQueue(rest);
    queueRef.current = rest;
    await loadTrack(ordered[startIndex]);
  };

  const skipToNext = () => {
    if (!queueRef.current.length) return;
    const [next, ...rest] = queueRef.current;
    queueRef.current = rest;
    setQueue(rest);
    loadTrack(next);
  };

  const addToQueue = (track: TrackMeta) => {
    setQueue((prev) => {
      const next = [...prev, track];
      queueRef.current = next;
      return next;
    });
  };

  const value = useMemo(
    () => ({
      player,
      status,
      setRate,
      isActive,
      rate,
      currentTrack,
      loadTrack,
      queue,
      shuffle,
      toggleShuffle: () => setShuffle((s) => !s),
      loadPlaylist,
      skipToNext,
      addToQueue,
      play: () => {
        try {
          player.play();
        } catch (error) {
          console.warn("Error playing:", error);
        }
      },
      pause: () => {
        try {
          player.pause();
        } catch (error) {
          console.warn("Error pausing:", error);
        }
      },
      toggle: () => {
        try {
          status.playing ? player.pause() : player.play();
        } catch (error) {
          console.warn("Error toggling playback:", error);
        }
      },
      seekBy: (seconds: number) => {
        try {
          const next = Math.max(
            0,
            Math.min(status.currentTime + seconds, status.duration)
          );
          player.seekTo(next);
        } catch (error) {
          console.warn("Error seeking:", error);
        }
      },
    }),
    [player, status, rate, currentTrack, queue, shuffle]
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error("useAudio must be used within AudioPlayerProvider");
  }
  return ctx;
}
