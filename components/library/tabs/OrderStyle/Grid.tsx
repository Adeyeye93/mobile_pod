import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { images } from "@/constants/image";
import CreatorCover from "@/components/CreatorCover";

// Define color tones for each playlist type
const PLAYLIST_COLORS: Record<CustomType, { bg: string; text: string }> = {
  "Listen Later": {
    bg: "#4F46E5", // Indigo
    text: "#E0E7FF",
  },
  "Archive": {
    bg: "#06B6D4", // Cyan
    text: "#06D6D7",
  },
  "Liked Podcasts": {
    bg: "#EC4899", // Pink
    text: "#FCE7F3",
  },
  "Recently Played": {
    bg: "#F59E0B", // Amber
    text: "#FCD34D",
  },
};

const Grid = ({
  use_icon,
  color,
  icon,
  Type = "Listen Later",
  episodeCount = 0,
  non_icon,
  author,
  onPress
}: GridProps) => {
  const playlistColor = PLAYLIST_COLORS[Type];
  const creators = [
    images.profile1,
  ];

  // Use custom color for this type, OR use image color for "Liked Podcasts"
  const backgroundColor =
    Type === "Liked Podcasts" ? color?.colorFour.value : playlistColor.bg;

  return (
    <View className="h-44 w-32 ">
      {use_icon && (
        <Pressable
          className="h-full w-full flex-col items-center justify-between"
          onPress={onPress}
        >
          <View
            className="w-32 h-32 flex-row items-center justify-center rounded-lg"
            style={{
              backgroundColor: backgroundColor,
            }}
          >
            <Image className="w-3/5 h-3/5" tintColor="#ffffff" source={icon} />
          </View>
          <View className="w-full h-9">
            <Text
              className="text-xs text-textSecondary font-MonBold"
              numberOfLines={1}
            >
              {Type}
            </Text>
            <Text
              className="text-xs text-[#6b7280] font-MonRegular"
              numberOfLines={1}
            >
              Playlist | {episodeCount} Episodes
            </Text>
          </View>
        </Pressable>
      )}
      {non_icon && (
        <Pressable
          className="w-full h-full  items-center flex-col justify-between"
          onPress={onPress}
        >
          <CreatorCover creators={creators} />
          <View className="w-full h-12 flex-col justify-between">
            <Text
              className="text-xs text-textSecondary font-MonBold"
              numberOfLines={2}
            >
              {author}
            </Text>
            <Text
              className="text-xs text-[#6b7280] font-MonRegular"
              numberOfLines={1}
            >
              Podcast | {episodeCount} Episodes
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
};

export default Grid;
