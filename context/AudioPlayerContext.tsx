import { createContext, useContext, useMemo, useEffect, useRef, useState } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/libs/api";

export interface TrackMeta {
  id: string;
  title: string;
  creatorName: string;
  thumbnail: string | null;
  creatorAvatar: string | null;
  masterUrl: string;
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

  const loadTrack = async (track: TrackMeta) => {
    // Save progress for the track we're leaving
    if (currentTrack && currentTimeRef.current > 0) {
      api.post(`streams/${currentTrack.id}/progress`, {
        progress_seconds: Math.floor(currentTimeRef.current),
      }).catch(() => {});
    }
    setCurrentTrack(track);
    try {
      player.replace({ uri: track.masterUrl });
      player.play();
    } catch (err) {
      console.error("[loadTrack] player error:", err);
    }
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
    [player, status, rate, currentTrack]
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
