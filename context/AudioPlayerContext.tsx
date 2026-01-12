import { createContext, useContext, useMemo, useEffect, useState } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  const value = useMemo(
    () => ({
      player,
      status,
      setRate,
      isActive,
      rate,
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
    [player, status, rate]
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
