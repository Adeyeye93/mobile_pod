import { View, Image, Text, Pressable } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Banner from "@/components/author/podcast/Banner";
import { images } from "@/constants/image";
import PodcastPlayer from "@/components/author/podcast/PodcastPlayer";
import { LinearGradient } from "expo-linear-gradient";
import { useImageColors } from "@/hook/useImageColors";
import { icons } from "@/constants/icons";
import { usePlayer } from "@/context/PlayerContext";
import Comments from "../Comments";
import { useOptionsSheet } from "@/context/CreateSheetContext";
import AboutArtist from "../AboutArtist";
import { useAudio } from "@/context/AudioPlayerContext";
import { useListeningParty } from "@/hook/useListeningParty";

// ─── Pulsing dot for "live" listeners indicator ───────────────────────────────
function PulseDot({ color }: { color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 800 }),
        withTiming(0.7, { duration: 800 }),
      ),
      -1,
      false,
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * 1.8 }],
    opacity: opacity.value * 0.4,
  }));

  return (
    <View className="w-4 h-4 items-center justify-center">
      <Animated.View
        style={[ringStyle, { position: "absolute", width: 8, height: 8, borderRadius: 4, backgroundColor: color }]}
      />
      <Animated.View
        style={[dotStyle, { width: 7, height: 7, borderRadius: 4, backgroundColor: color }]}
      />
    </View>
  );
}

function formatListeners(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

// ─── Main player ─────────────────────────────────────────────────────────────

const Player = () => {
  const { currentTrack, status } = useAudio();
  const { ref } = usePlayer();
  const { ref: Opt } = useOptionsSheet();

  const bannerImage = currentTrack?.thumbnail
    ? { uri: currentTrack.thumbnail }
    : images.podDefault;

  const colors = useImageColors(bannerImage);
  const accentColor: string = colors?.colorTwo.value;

  const { listenerCount, connected } = useListeningParty(
    currentTrack?.id,
    status.playing,
  );

  return (
    <View className="flex-1 bg-background px-4">
      <View
        className="absolute top-0 h-full left-0 right-0 z-0 overflow-hidden"
        style={{ backgroundColor: colors?.colorThree.value }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(24,26,32,0.5)", "rgba(24,26,32,1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="w-full h-full"
        />
      </View>

      <BottomSheetScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* ─── Top bar ───────────────────────────────────────────────────── */}
        <View className="mt-14 h-20 flex-col items-center justify-between">
          <View className="w-full h-1/2 flex-row items-center justify-between">
            <Pressable onPress={() => ref.current?.close()}>
              <Image className="w-7 h-7" source={icons.close_modal} />
            </Pressable>
            <View className="flex-col items-center">
              <Text className="text-textSecondary font-MonRegular text-sm">
                PLAYING FROM
              </Text>
              <Text
                className="text-textSecondary font-MonBold text-sm"
                numberOfLines={1}
              >
                {currentTrack?.creatorName ?? "Echo"}
              </Text>
            </View>
            <Pressable onPress={() => Opt.current?.expand()}>
              <Image className="w-7 h-7" source={icons.menu} />
            </Pressable>
          </View>

          {/* ─── Listener count ──────────────────────────────────────────── */}
          <View className="h-1/2 flex-row items-center justify-center gap-2">
            {connected && listenerCount > 0 ? (
              <>
                <PulseDot color={accentColor} />
                <Text className="text-textPrimary font-MonMedium text-xs">
                  {formatListeners(listenerCount)}
                </Text>
                <Text className="text-textSecondary font-MonRegular text-xs">
                  listening now
                </Text>
              </>
            ) : (
              <>
                <PulseDot color="#555" />
                <Text className="text-textSecondary font-MonRegular text-xs">
                  {status.playing ? "Connecting…" : "Start playing to go live"}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* ─── Album art ─────────────────────────────────────────────────── */}
        <View className="w-full flex-col items-center justify-start mt-10">
          <Banner
            imageUrl={bannerImage}
            title={currentTrack?.title}
            creator={currentTrack?.creatorName}
          />
        </View>

        <PodcastPlayer color={colors} />

        {/* ─── Comments + About ──────────────────────────────────────────── */}
        <View className="w-full h-80 flex-col items-center justify-evenly">
          <Comments colors={colors} />
          <AboutArtist
            artist={currentTrack?.creatorName ?? "Unknown"}
            creatorId={currentTrack?.creatorId}
            image={
              currentTrack?.creatorAvatar
                ? { uri: currentTrack.creatorAvatar }
                : images.podDefault
            }
            followers={2500}
            SreamCount={360000}
            description=""
          />
        </View>
      </BottomSheetScrollView>
    </View>
  );
};

export default Player;
