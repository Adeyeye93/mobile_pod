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

  useEffect(() => {
    AsyncStorage.getItem("playback_rate").then((v) => {
      if (v) {
        const r = Number(v);
        if (!Number.isNaN(r)) {
          setRateState(r);
          player.setPlaybackRate(r);
        }
      }
    });
  }, []);

  const setRate = async (value: number) => {
    setRateState(value);
    player.setPlaybackRate(value);
    await AsyncStorage.setItem("playback_rate", String(value));
  };


  const value = useMemo(
    () => ({
      player,
      status,
      setRate,
      isActive,
      rate,
      play: () => player.play(),
      pause: () => player.pause(),
      toggle: () => (status.playing ? player.pause() : player.play()),
      seekBy: (seconds: number) => {
        const next = Math.max(
          0,
          Math.min(status.currentTime + seconds, status.duration)
        );
        player.seekTo(next);
      },
    }),
    [player, status]
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
