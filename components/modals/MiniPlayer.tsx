import { View, Text, Pressable, Image } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import useImageColors from "@/hook/useImageColors";

export default function MiniPlayer() {
  const router = useRouter();
  const bannerImage = images.pod4;
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const colors = useImageColors({ imageUrl: bannerImage });


  return (
    <Pressable
      onPress={() => router.push("/home/author/podcast/player")}
      className="absolute bottom-24 left-0 right-0  bg-[#] p-3 flex-row items-center justify-between w-full"
      style={{ zIndex: 40, backgroundColor: colors?.muted }} // Use vibrant color as background
    >
      {/* Podcast info */}
      <View className="flex-row items-center flex-1 gap-3">
        <Image source={bannerImage} className="w-12 h-12 rounded" />
        <View className="flex-1">
          <Text numberOfLines={1} className="text-textPrimary font-MonBold text-sm">
            685: Steve Rambam | The Real Life...
          </Text>
          <Text className="text-textSecondary font-MonMedium text-xs">
            Family Bad | Feedback Friday
          </Text>
        </View>
      </View>

      {/* Play/Pause */}
      <View className="flex flex-row h-full w-20 justify-evenly items-center">
        <Pressable onPress={() => setIsSaved(!isSaved)}>
          {isSaved && <Image source={icons.save} className="w-6 h-6" />}
          {!isSaved && <Image source={icons.saved} className="w-6 h-6" />}
        </Pressable>

        <Pressable onPress={() => setIsPlaying(!isPlaying)}>
          {isPlaying && <Image source={icons.pause} className="w-6 h-6" />}
          {!isPlaying && <Image source={icons.play} className="w-6 h-6" />}
        </Pressable>
      </View>
    </Pressable>
  );
}
