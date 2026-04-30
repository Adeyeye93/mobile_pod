import { View, Text, Pressable, Image } from "react-native";
import { useState, useEffect, useRef } from "react";
import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import { useImageColors } from "@/hook/useImageColors";
import { useMiniPlayer } from "@/context/MiniPlayerContext";
import { useAudio } from "@/context/AudioPlayerContext";
import { usePlayer } from "./player";
import { Ionicons } from "@expo/vector-icons";
import { useLiveStream } from "@/context/stream/StreamContext";
import { useCreatorMode } from "@/context/CreatorModeContext";

// ─── Elapsed timer hook ───────────────────────────────────────────────────────
function useElapsedTime(startedAt: string | null) {
  const [elapsed, setElapsed] = useState("00:00:00");

  useEffect(() => {
    if (!startedAt) return;
    const origin = new Date(startedAt).getTime();

    const tick = () => {
      const diff = Math.floor((Date.now() - origin) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      const pad = (n: number) => String(n).padStart(2, "0");
      setElapsed(`${pad(h)}:${pad(m)}:${pad(s)}`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return elapsed;
}

// ─── Creator Live Mini Player ─────────────────────────────────────────────────
function CreatorLiveMiniPlayer({
  title,
  actualStartTime,
  positionStyles,
  onPress,
  onInvite,
  onMenu,
}: {
  title: string;
  actualStartTime: string | null;
  positionStyles: object;
  onPress: () => void;
  onInvite: () => void;
  onMenu: () => void;
}) {
  const elapsed = useElapsedTime(actualStartTime ?? new Date().toISOString());

  return (
    <Pressable
      onPress={onPress}
      className="absolute left-0 right-0 flex-row items-center px-3 py-2.5 rounded-t-xl border-t border-red-800/40"
      style={{
        zIndex: 10,
        backgroundColor: "#1a0d0d",
        ...positionStyles,
      }}
    >
      {/* Animated live top bar */}
      <View className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary opacity-80" />

      {/* LIVE badge */}
      <View className="flex-row items-center gap-1 bg-primary rounded px-1.5 py-0.5 mr-3">
        <View className="w-1.5 h-1.5 rounded-full bg-white" />
        <Text className="text-white font-MonBold text-[10px] tracking-widest">
          LIVE
        </Text>
      </View>

      {/* Stream info */}
      <View className="flex-1 min-w-0 mr-3">
        <Text numberOfLines={1} className="text-white font-MonBold text-[13px]">
          {title}
        </Text>
        <Text className="text-red-400/70 font-MonMedium text-[11px] mt-0.5">
          ● {elapsed} elapsed
        </Text>
      </View>

      {/* Creator actions */}
      <View className="flex-row items-center gap-3">
        {/* Invite */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onInvite();
          }}
          className="items-center gap-0.5"
        >
          <View className="w-7 h-7 rounded-lg bg-white/8 items-center justify-center">
            <Ionicons name="person-add-outline" size={14} color="#fff" />
          </View>
          <Text className="text-white/35 font-MonRegular text-[8px]">
            Invite
          </Text>
        </Pressable>

        {/* Mic toggle */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="items-center gap-0.5"
        >
          <View className="w-7 h-7 rounded-lg bg-white/8 items-center justify-center">
            <Ionicons name="mic-outline" size={14} color="#ff6b6b" />
          </View>
          <Text className="text-white/35 font-MonRegular text-[8px]">Mic</Text>
        </Pressable>

        {/* More menu */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onMenu();
          }}
          className="w-7 h-7 rounded-lg bg-white/8 items-center justify-center flex-col gap-0.5"
        >
          <View className="w-1 h-1 rounded-full bg-white/60" />
          <View className="w-1 h-1 rounded-full bg-white/60" />
          <View className="w-1 h-1 rounded-full bg-white/60" />
        </Pressable>
      </View>
    </Pressable>
  );
}

// ─── Main MiniPlayer ──────────────────────────────────────────────────────────
export default function MiniPlayer() {
  const { config } = useMiniPlayer();
  const bannerImage = images.pod;
  const { status, toggle, isActive } = useAudio();
  const [isSaved, setIsSaved] = useState(false);
  const colors = useImageColors(bannerImage);
  const { ref } = usePlayer();

  // Pull from your StreamContext — adjust field names to match your context shape
  const { title, activeStream } = useLiveStream();
  const { isCreatorMode } = useCreatorMode();
  const isCreatorLive = isCreatorMode && activeStream?.status === "live";

  const progressPercent =
    status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0;

  if (!config.isVisible || !isActive) return null;

  const positionStyles =
    config.position === "bottom"
      ? { bottom: config.offset ?? 96 }
      : { top: config.offset ?? 0 };

  // ── Creator live mode ──────────────────────────────────────────────────────
  if (isCreatorLive) {
    return (
      <CreatorLiveMiniPlayer
        title={activeStream?.title ?? "Live stream"}
        actualStartTime={activeStream?.actual_start_time}
        positionStyles={positionStyles}
        onPress={() => ref.current?.expand()}
        onInvite={() => {
          // open invite sheet / share modal
        }}
        onMenu={() => {
          // open bottom sheet with more creator options
        }}
      />
    );
  }


  if (isActive && !isCreatorMode) {
    return (
      <Pressable
        onPress={() => ref.current?.expand()}
        className="absolute left-0 right-0 p-3 flex-row items-center justify-between w-full rounded-t-xl"
        style={{
          zIndex: 10,
          backgroundColor: colors?.colorThree.value,
          ...positionStyles,
        }}
      >
        <View
          className="h-[2px] rounded-full absolute top-0 left-3 bg-primary"
          style={{ width: `${progressPercent}%` }}
        />
        <View className="flex-row items-center flex-1 gap-3">
          <Image source={bannerImage} className="w-12 h-12 rounded" />
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-textPrimary font-MonBold text-sm"
            >
              685: Steve Rambam | The Real Life...
            </Text>
            <Text className="text-textSecondary font-MonMedium text-xs">
              Family Bad | Feedback Friday
            </Text>
          </View>
        </View>
        <View className="flex flex-row h-full w-20 justify-center items-center gap-4">
          <Pressable onPress={() => setIsSaved(!isSaved)}>
            {isSaved ? (
              <Image source={icons.save} className="w-6 h-6" />
            ) : (
              <Image
                source={icons.saved}
                className="w-6 h-6"
                tintColor="#ffffff"
              />
            )}
          </Pressable>
          <Pressable onPress={toggle}>
            <Image
              source={status.playing ? icons.pause : icons.play}
              className="w-6 h-6"
            />
          </Pressable>
        </View>
      </Pressable>
    );
  }
  
}
