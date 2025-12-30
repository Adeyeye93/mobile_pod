import { View, Text, Pressable, Image } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import { useImageColors } from "@/hook/useImageColors";
import { useMiniPlayer } from "@/context/MiniPlayerContext";
import { useAudio } from "@/context/AudioPlayerContext";

export default function MiniPlayer() {
  const router = useRouter();
  const { config } = useMiniPlayer();
  const bannerImage = images.pod;
const { status, toggle } = useAudio();
  const [isSaved, setIsSaved] = useState(false);
  const colors = useImageColors(bannerImage);

  if (!config.isVisible) {
    return null;
  }

  const positionStyles =
    config.position === "bottom"
      ? { bottom: config.offset || 96 } // 96 = height of bottom nav
      : { top: config.offset || 0 }; // Adjust for top nav height

  return (
    <Pressable
      onPress={() => router.push("/home/author/podcast/player")}
      className="absolute left-0 right-0 p-3 flex-row items-center justify-between w-full"
      style={{
        zIndex: 40,
        backgroundColor: colors?.colorThree.value,
        ...positionStyles,
      }}
    >
      {/* Podcast info */}
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

      {/* Play/Pause */}
      <View className="flex flex-row h-full w-20 justify-center items-center gap-4">
        <Pressable onPress={() => setIsSaved(!isSaved)}>
          {isSaved && <Image source={icons.save} className="w-6 h-6" />}
          {!isSaved && (
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
