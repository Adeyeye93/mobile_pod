import { View, Image, Text, Pressable } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React from "react";
import Banner from "@/components/author/podcast/Banner";
import { images } from "@/constants/image";
import PodcastPlayer from "@/components/author/podcast/PodcastPlayer";
import { LinearGradient } from "expo-linear-gradient";
import { useImageColors } from "@/hook/useImageColors";
import { icons } from "@/constants/icons";
import { usePlayer } from "../modals/player";
import Comments from "../Comments";
import { useOptionsSheet } from "@/context/CreateSheetContext";
import AboutArtist from "../AboutArtist";
import { useAudio } from "@/context/AudioPlayerContext";

const listenerImageClass = "w-6 h-6 rounded-full -ml-3 border border-[#1E4D5F]";

const Player = () => {
  const { currentTrack } = useAudio();
  const { ref } = usePlayer();
  const { ref: Opt } = useOptionsSheet();

  const bannerImage = currentTrack?.thumbnail
    ? { uri: currentTrack.thumbnail }
    : images.thumbnail;

  const colors = useImageColors(bannerImage);

  return (
    <View className="flex-1 bg-background px-4">
      <View
        className="absolute top-0 h-full left-0 right-0 z-0 flex flex-col items-end justify-end overflow-hidden"
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
        <View className="mt-14 h-20 flex-col items-center justify-between">
          <View className="w-full h-1/2 flex flex-row items-center justify-between">
            <Pressable onPress={() => ref.current?.close()}>
              <Image className="w-7 h-7" source={icons.close_modal} />
            </Pressable>
            <View className="flex-col items-center">
              <Text className="text-textSecondary font-MonRegular text-sm">
                PLAYING FROM
              </Text>
              <Text className="text-textSecondary font-MonBold text-sm" numberOfLines={1}>
                {currentTrack?.creatorName ?? "Echo"}
              </Text>
            </View>
            <Pressable onPress={() => Opt.current?.expand()}>
              <Image className="w-7 h-7" source={icons.menu} />
            </Pressable>
          </View>
          <View className="w-full h-1/2 flex flex-row items-center justify-center">
            <View className="flex-row items-center">
              <Image source={images.profile1} className={listenerImageClass} />
              <Image source={images.profile2} className={listenerImageClass} />
              <Image source={images.profile3} className={listenerImageClass} />
              <Image source={images.profile4} className={listenerImageClass} />
              <Image source={images.profile5} className={listenerImageClass} />
            </View>
            <Text className="text-textPrimary font-MonMedium text-xs">
              {" "}+3.8k{" "}
              <Text className="text-secondary font-MonRegular text-xm">
                listening with you
              </Text>
            </Text>
          </View>
        </View>

        <View className="w-full h-fit flex-col items-center justify-start mt-10">
          <Banner
            imageUrl={bannerImage}
            title={currentTrack?.title}
            creator={currentTrack?.creatorName}
          />
        </View>

        <PodcastPlayer color={colors} />

        <View className="w-full h-80 flex-col items-center justify-evenly">
          <Comments colors={colors} />
          <AboutArtist
            artist={currentTrack?.creatorName ?? "Unknown"}
            image={
              currentTrack?.creatorAvatar
                ? { uri: currentTrack.creatorAvatar }
                : images.pod1
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
