import { View, Text, Pressable, Image } from "react-native";
import { useState } from "react";
import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import { useImageColors } from "@/hook/useImageColors";
import { useMiniPlayer } from "@/context/MiniPlayerContext";
import { useAudio } from "@/context/AudioPlayerContext";
import { usePlayer } from "@/context/PlayerContext";
import { Ionicons } from "@expo/vector-icons";
import { useLiveNotification } from "@/context/LiveNotificationContext";
import { useCreatorMode } from "@/context/CreatorModeContext";

// ─── Creator Live Mini Player ─────────────────────────────────────────────────
function CreatorLiveMiniPlayer({
  title,
  elapsed,
  positionStyles,
  onPress,
  onInvite,
  onMenu,
}: {
  title: string;
  elapsed: string;
  positionStyles: object;
  onPress: () => void;
  onInvite: () => void;
  onMenu: () => void;
}) {
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

        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="items-center gap-0.5"
        >
          <View className="w-7 h-7 rounded-lg bg-white/8 items-center justify-center">
            <Ionicons name="mic-outline" size={14} color="#ff6b6b" />
          </View>
          <Text className="text-white/35 font-MonRegular text-[8px]">Mic</Text>
        </Pressable>

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
  const { status, toggle, isActive, currentTrack } = useAudio();
  const [isSaved, setIsSaved] = useState(false);
  const bannerImage = currentTrack?.thumbnail
    ? { uri: currentTrack.thumbnail }
    : images.podDefault;
  const colors = useImageColors(bannerImage);
  const { ref } = usePlayer();

  const { mode, currentSession, elapsed } = useLiveNotification();
  const { isCreatorMode } = useCreatorMode();
  const isCreatorLive = mode === "creator_live";

  const progressPercent =
    status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0;

  const { isExpanded: isPlayerExpanded } = usePlayer();

  if (!config.isVisible || (!isActive && !isCreatorLive) || isPlayerExpanded) return null;

  const positionStyles =
    config.position === "bottom"
      ? { bottom: config.offset ?? 96 }
      : { top: config.offset ?? 0 };

  if (isCreatorLive) {
    return (
      <CreatorLiveMiniPlayer
        title={(currentSession as any)?.title ?? "Live stream"}
        elapsed={elapsed}
        positionStyles={positionStyles}
        onPress={() => ref.current?.expand()}
        onInvite={() => {}}
        onMenu={() => {}}
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
              {currentTrack?.title ?? ""}
            </Text>
            <Text className="text-textSecondary font-MonMedium text-xs" numberOfLines={1}>
              {currentTrack?.creatorName ?? ""}
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
