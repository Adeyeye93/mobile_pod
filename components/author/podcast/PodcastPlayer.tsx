import { icons } from "@/constants/icons";
import { useAudio } from "@/context/AudioPlayerContext";
import { useEffect, useRef } from "react";
import { Image, PanResponder, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface PodcastPlayerProps {
  audioSource: any;
  color: any;
}

export default function PodcastPlayer({
  audioSource,
  color,
}: PodcastPlayerProps) {
  const { player, status, toggle, seekBy, setRate, rate } = useAudio();

  const barWidth = useRef(0);

  useEffect(() => {
    if (audioSource) {
      player.replace(audioSource);
    }
  }, [audioSource]);

  const seekToPosition = (x: number) => {
    if (!barWidth.current || !status.duration) return;
    const ratio = Math.max(0, Math.min(x / barWidth.current, 1));
    player.seekTo(ratio * status.duration);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      seekToPosition(e.nativeEvent.locationX);
    },
    onPanResponderMove: (e) => {
      seekToPosition(e.nativeEvent.locationX);
    },
    onPanResponderRelease: () => {
      // Scrubbing ended
    },
  });

  const progressPercent =
    status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0;

  // Generate waveform data
  const waveformBars = Array.from({ length: 60 }, () =>
    Math.floor(Math.random() * 100),
  );

  return (
    <View className="w-full gap-6">
      {/* Waveform Visualization */}
      <View
        className="flex-row items-center justify-center gap-0.5 h-20"
        {...panResponder.panHandlers}
      >
        {waveformBars.map((height, index) => (
          <AnimatedBar
            BarColor={color}
            key={index}
            height={height}
            isPlayed={(index / waveformBars.length) * 100 < progressPercent}
            onPress={() =>
              seekToPosition((index / waveformBars.length) * barWidth.current)
            }
          />
        ))}
      </View>

      {/* Time */}
      <View className="flex-row justify-between w-full px-2">
        <Text
          className="text-sm font-MonMedium"
          style={{
            color: color?.colorTwo.value,
          }}
        >
          {formatDuration(status.currentTime)}
        </Text>
        <Text className="text-sm text-gray-400 font-MonMedium">
          {formatDuration(status.duration)}
        </Text>
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-center gap-8 mt-4">
        <Pressable onPress={() => seekBy(-15)}>
          <Image source={icons.playBack} className="w-7 h-7" />
        </Pressable>

        <Pressable
          onPress={toggle}
          className="bg-primary w-14 h-14 rounded-full items-center justify-center"
        >
          <Image
            source={status.playing ? icons.pause : icons.play}
            className="w-7 h-7"
          />
        </Pressable>

        <Pressable onPress={() => seekBy(15)}>
          <Image source={icons.playfarward} className="w-7 h-7" />
        </Pressable>
      </View>

      {/* Speed & More Options */}
      <View className="flex-row justify-around items-center w-full">
        <Pressable
          onPress={() => {
            const speeds = [1, 1.25, 1.5, 2];
            const nextIndex = (speeds.indexOf(rate) + 1) % speeds.length;
            setRate(speeds[nextIndex]);
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

// Animated Bar Component
function AnimatedBar({
  BarColor,
  height,
  isPlayed,
  onPress,
}: {
  BarColor: any;
  height: number;
  isPlayed: boolean;
  onPress: () => void;
}) {
  const barHeight = useSharedValue(height);
  const barColor = useSharedValue(isPlayed ? 1 : 0);

  useEffect(() => {
    barHeight.value = withTiming(Math.max(20, height), {
      duration: 500,
    });

    barColor.value = withTiming(isPlayed ? 1 : 0, {
      duration: 500,
    });
  }, [height, isPlayed]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${barHeight.value}%`,
  }));

  const colorStyle = useAnimatedStyle(() => ({
    backgroundColor:
      barColor.value === 1 ? `${BarColor?.colorTwo.value}` : "#E0E0E0",
  }));

  return (
    <Pressable onPress={onPress} className="flex-1 items-center justify-end">
      <Animated.View
        style={[animatedStyle, colorStyle]}
        className="w-full rounded-sm"
      />
    </Pressable>
  );
}

function formatDuration(sec = 0) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
