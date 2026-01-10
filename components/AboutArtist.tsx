import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { icons } from "@/constants/icons";
import { useFormatNumber, useSecondsToHours } from "@/hook/FormatArtistData";
import { useRouter } from "expo-router";
import { usePlayer } from "./modals/player";

type aboutArtist = {
  followers: number;
  SreamCount: number;
  image: any;
  description: string;
  artist: string;
};

const AboutArtist = ({
  followers,
  SreamCount,
  image,
  description,
  artist,
}: aboutArtist) => {
  const formatedNum = useFormatNumber(followers);
  const formatedSec = useSecondsToHours(SreamCount);
  const route = useRouter();
  const { ref } = usePlayer();

  const handleRedirect = (link: any) => {
    ref.current?.close();
    route.navigate(link);
  };

  return (
    <View className="bg-modal w-full h-2/5 rounded-lg flex-col items-center justify-between p-3">
      <View className="w-full h-2/5 flex-row items-center justify-between ">
        <View className="flex-1 h-full flex-row items-center justify-start gap-2">
          <Image className="w-12 h-12" source={image} />
          <View className="">
            <Text className="text-textPrimary font-MonBold">{artist}</Text>
            <Text className="text-textPrimary font-MonRegular text-xs">
              {formatedNum} Follower{" "}
              {SreamCount >= 360000 ? `| ${formatedSec} monthly streams` : ""}
            </Text>
          </View>
        </View>
        <Pressable onPress={() => handleRedirect("/home/author/Ted Talk")}>
          <Image className="w-7 h-7" source={icons.redirect} />
        </Pressable>
      </View>
      <View className=" h-3/5 w-full">
        <Text
          numberOfLines={3}
          className="text-textSecondary font-MonMedium text-xs pt-3"
        >
          {description}
        </Text>
      </View>
    </View>
  );
};

export default AboutArtist;
