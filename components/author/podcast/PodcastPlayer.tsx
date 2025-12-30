import { icons } from "@/constants/icons";
import {
  View,
  Pressable,
  Text,
  Image,
  PanResponder,
  LayoutChangeEvent,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useAudio } from "@/context/AudioPlayerContext";

interface PodcastPlayerProps {
  audioSource: any;
}

export default function PodcastPlayer({ audioSource }: PodcastPlayerProps) {
  const { player, status, toggle, seekBy, setRate, rate } = useAudio();

  const barWidth = useRef(0);
  const [isScrubbing, setIsScrubbing] = useState(false);

  useEffect(() => {
    if (audioSource) {
      player.replace(audioSource);
      player.play();
    }
  }, [audioSource]);

  const onBarLayout = (e: LayoutChangeEvent) => {
    barWidth.current = e.nativeEvent.layout.width;
  };

  const seekToPosition = (x: number) => {
    if (!barWidth.current || !status.duration) return;
    const ratio = Math.max(0, Math.min(x / barWidth.current, 1));
    player.seekTo(ratio * status.duration);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      setIsScrubbing(true);
      seekToPosition(e.nativeEvent.locationX);
    },
    onPanResponderMove: (e) => {
      seekToPosition(e.nativeEvent.locationX);
    },
    onPanResponderRelease: () => {
      setIsScrubbing(false);
    },
  });

  const progressPercent =
    status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0;

  return (
    <View className="w-full h-64 items-center gap-3">
      {/* Seek bar */}
      <View
        onLayout={onBarLayout}
        {...panResponder.panHandlers}
        className="h-2 w-full bg-[#ffffff22] rounded-full relative"
      >
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${progressPercent}%` }}
        />

        <View
          className="h-4 w-4 absolute -top-[4px] bg-primary rounded-full"
          style={{ left: `${progressPercent}%`, marginLeft: -8 }}
        />
      </View>

      {/* Time */}
      <View className="flex-row justify-between w-full">
        <Text className="text-sm text-textSecondary">
          {formatDuration(status.currentTime)}
        </Text>
        <Text className="text-sm text-textSecondary">
          {formatDuration(status.duration)}
        </Text>
      </View>

      {/* Controls */}
      <View className="flex-row items-center gap-10 mt-6">
        <Pressable onPress={() => seekBy(-15)}>
          <Image source={icons.prev} className="w-10 h-10" />
        </Pressable>
        <Pressable onPress={() => seekBy(-15)}>
          <Image source={icons.playBack} className="w-8 h-8" />
        </Pressable>
        <Pressable
          onPress={toggle}
          className="bg-primary w-16 h-16 rounded-full items-center justify-center"
        >
          <Image
            source={status.playing ? icons.pause : icons.play}
            className="w-10 h-10"
          />
        </Pressable>

        <Pressable onPress={() => seekBy(15)}>
          <Image source={icons.playfarward} className="w-8 h-8" />
        </Pressable>
        <Pressable onPress={() => seekBy(15)}>
          <Image source={icons.next} className="w-10 h-10" />
        </Pressable>
      </View>
      <View className="flex-1  w-full flex-row flex items-center justify-evenly">
        <Pressable
          onPress={() => {
            const next = rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : 1;
            setRate(next);
          }}
          className=""
        >
          <Image source={icons.speedPerfomance} className="w-8 h-8"></Image>
        </Pressable>
        <Pressable
          onPress={() => {
            const next = rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : 1;
            setRate(next);
          }}
          className=""
        >
          <Image source={icons.timer} className="w-8 h-8"></Image>
        </Pressable>
        <Pressable
          onPress={() => {
            const next = rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : 1;
            setRate(next);
          }}
          className=""
        >
          <Image source={icons.invite} className="w-8 h-8"></Image>
        </Pressable>
        <Pressable
          onPress={() => {
            const next = rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : 1;
            setRate(next);
          }}
          className=""
        >
          <Image source={icons.menu} className="w-8 h-8"></Image>
        </Pressable>
      </View>
    </View>
  );
}

function formatDuration(sec = 0) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
