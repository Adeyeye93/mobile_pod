import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { images } from "@/constants/image";
import { icons } from "@/constants/icons";

const Header = () => {
  return (
    <View className="w-full h-fit flex-row items-center justify-start gap-4">
      <View className="w-fit h-fit relative rounded-full">
        <Image className="w-24 h-24 rounded-full" source={images.profile} />
        <Pressable className="absolute bottom-0 right-3">
          <Image className="w-6 h-6" source={icons.edit} />
        </Pressable>
      </View>
      <View className=" h-24 items-start justify-between w-full py-4">
        <Text className="text-lg font-MonBold text-textPrimary">Adeyeye Seyi</Text>
        <Text className="text-textSecondary">0 Subscriber</Text>
      </View>
    </View>
  );
};

export default Header;
