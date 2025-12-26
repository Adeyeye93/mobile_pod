import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { icons } from "@/constants/icons";
import { useRouter } from "expo-router";
import RssLink from "./modals/RssLink";

type PageHeadProps = {
  title: string;
  has_link?: boolean;
};

const PageHead = ({ title, has_link }: PageHeadProps) => {
  const router = useRouter();
  return (
    <View className="w-full p-2 flex flex-row items-center justify-between mt-16 pb-10">
      <View className="flex flex-row items-center gap-6">
        <Pressable
          onPress={() => {
            router.back();
          }}
        >
          <Image source={icons.backPage} className="w-7 h-7" />
        </Pressable>
        <View>
          <Text className="text-textPrimary font-MonBold text-2xl">
            {title}
          </Text>
        </View>
      </View>
      <View className="flex flex-row items-center gap-7 justify-end">
        {has_link && (
          <Pressable onPress={() => console.log("shit")}>
            <RssLink />
          </Pressable>
        )}
        <Pressable onPress={() => console.log("shit")}>
          <Image source={icons.topMenu} className="w-7 h-7" />
        </Pressable>
      </View>
    </View>
  );
};

export default PageHead;
