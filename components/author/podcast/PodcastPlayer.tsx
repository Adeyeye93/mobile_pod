import { icons } from "@/constants/icons";
import { useAudio } from "@/context/AudioPlayerContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image, PanResponder, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface PodcastPlayerProps {
  color: any;
}

// ─── Deterministic waveform seeded by track ID ────────────────────────────────
// Produces a natural audio-like shape (multi-frequency waves + envelope)
function seededWaveform(seed: string, count: number): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return Array.from({ length: count }, (_, i) => {
    const t = i / count;
    const envelope = 0.3 + 0.7 * Math.sin(t * Math.PI);
    const w1 = Math.sin(t * Math.PI * 4 + hash * 0.0011) * 0.25;
    const w2 = Math.sin(t * Math.PI * 9 + hash * 0.0019) * 0.18;
    const w3 = Math.sin(t * Math.PI * 15 + hash * 0.0031) * 0.10;
    const v = (0.45 + w1 + w2 + w3) * envelope;
    return Math.max(12, Math.min(100, Math.round(v * 100)));
  });
}

function formatDuration(sec = 0) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export default function PodcastPlayer({ color }: PodcastPlayerProps) {
  const { player, status, toggle, seekBy, setRate, rate, currentTrack } = useAudio();

  const [containerW, setContainerW] = useState(0);
  const progressShared = useSharedValue(0);

  // Guard against empty string from useImageColors before colors resolve
  const accentColor: string = color?.colorTwo?.value || "#e63946";

  const progressPercent =
    status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0;

  // Drive progress outside of render to satisfy Reanimated strict mode
  useEffect(() => {
    progressShared.value = withTiming(progressPercent / 100, { duration: 120 });
  }, [progressPercent, progressShared]);

  // Stable bars seeded from track ID — never regenerates while same track plays
  const bars = useMemo(
    () => seededWaveform(currentTrack?.id ?? "default", 55),
    [currentTrack?.id],
  );

  // Overlay clipping: one animated width hides the "unplayed" portion of colored bars
  const overlayStyle = useAnimatedStyle(() => ({
    width: progressShared.value * containerW,
  }));

  // Thumb slides along the playhead
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progressShared.value * containerW - 7 }],
  }));

  // ─── Scrubbing ─────────────────────────────────────────────────────────────
  const seekToX = (x: number) => {
    if (!containerW || !status.duration) return;
    const ratio = Math.max(0, Math.min(x / containerW, 1));
    player.seekTo(ratio * status.duration);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => seekToX(e.nativeEvent.locationX),
      onPanResponderMove: (e) => seekToX(e.nativeEvent.locationX),
    }),
  ).current;

  return (
    <View className="w-full gap-5">
      {/* ─── Waveform ─────────────────────────────────────────────────────── */}
      <View
        className="h-20 relative"
        onLayout={(e) => setContainerW(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        {/* Unplayed bars — muted */}
        <View className="absolute inset-0 flex-row items-end pb-0">
          {bars.map((h, i) => (
            <View
              key={i}
              style={{ flex: 1, height: `${h}%`, marginHorizontal: 1, borderRadius: 3, backgroundColor: "#2e2e3e" }}
            />
          ))}
        </View>

        {/* Played overlay — same bars, accent colour, clipped to progress */}
        {containerW > 0 && (
          <Animated.View
            style={[overlayStyle, { position: "absolute", top: 0, bottom: 0, left: 0, overflow: "hidden" }]}
            pointerEvents="none"
          >
            <View style={{ flexDirection: "row", alignItems: "flex-end", width: containerW, height: 80 }}>
              {bars.map((h, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    marginHorizontal: 1,
                    borderRadius: 3,
                    backgroundColor: accentColor,
                  }}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Playhead thumb */}
        {containerW > 0 && (
          <Animated.View
            style={[
              thumbStyle,
              {
                position: "absolute",
                top: "50%",
                marginTop: -7,
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: "#fff",
                shadowColor: accentColor,
                shadowOpacity: 0.6,
                shadowRadius: 6,
                elevation: 4,
              },
            ]}
            pointerEvents="none"
          />
        )}
      </View>

      {/* ─── Time labels ──────────────────────────────────────────────────── */}
      <View className="flex-row justify-between px-1 -mt-2">
        <Text className="text-sm font-MonMedium" style={{ color: accentColor }}>
          {formatDuration(status.currentTime)}
        </Text>
        <Text className="text-sm text-gray-400 font-MonMedium">
          -{formatDuration(Math.max(0, status.duration - status.currentTime))}
        </Text>
      </View>

      {/* ─── Controls ─────────────────────────────────────────────────────── */}
      <View className="flex-row items-center justify-center gap-10 mt-2">
        <Pressable onPress={() => seekBy(-15)} hitSlop={12}>
          <Image source={icons.playBack} className="w-7 h-7" />
        </Pressable>

        <Pressable
          onPress={toggle}
          className="w-16 h-16 rounded-full items-center justify-center"
          style={{ backgroundColor: accentColor }}
        >
          <Image
            source={status.playing ? icons.pause : icons.play}
            className="w-7 h-7"
          />
        </Pressable>

        <Pressable onPress={() => seekBy(15)} hitSlop={12}>
          <Image source={icons.playfarward} className="w-7 h-7" />
        </Pressable>
      </View>

      {/* ─── Extra controls ───────────────────────────────────────────────── */}
      <View className="flex-row justify-around items-center w-full mt-1">
        <Pressable
          onPress={() => {
            const speeds = [1, 1.25, 1.5, 2];
            setRate(speeds[(speeds.indexOf(rate) + 1) % speeds.length]);
          }}
          className="items-center gap-1"
        >
          <Image source={icons.speedRate} className="w-6 h-6" />
          <Text className="text-xs text-gray-400 font-MonRegular">{rate}x</Text>
        </Pressable>

        <Pressable className="items-center gap-1">
          <Image source={icons.invite} className="w-6 h-6" />
          <Text className="text-xs text-gray-400 font-MonRegular">Invite</Text>
        </Pressable>

        <Pressable className="items-center gap-1">
          <Image source={icons.queue} className="w-6 h-6" />
          <Text className="text-xs text-gray-400 font-MonRegular">Queue</Text>
        </Pressable>

        <Pressable className="items-center gap-1">
          <Image source={icons.timer} className="w-6 h-6" />
          <Text className="text-xs text-gray-400 font-MonRegular">Sleep</Text>
        </Pressable>
      </View>
    </View>
  );
}
