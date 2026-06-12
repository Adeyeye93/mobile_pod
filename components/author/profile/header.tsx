import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { icons } from "@/constants/icons";

interface DataProp {
  username: string;
  avatarUrl?: string;
  Sub: number;
}

const Header = ({ username, avatarUrl, Sub }: DataProp) => {
  return (
    <View className="w-full h-fit flex-row items-center justify-start gap-4">
      <View className="w-fit h-fit relative rounded-full">
        {avatarUrl ? (
          <Image
            className="w-24 h-24 rounded-full"
            source={{ uri: avatarUrl }}
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center">
            <Text className="text-primary font-MonBold text-3xl">
              {(username ?? "U")[0].toUpperCase()}
            </Text>
          </View>
        )}
        <Pressable className="absolute bottom-0 right-3">
          <Image className="w-6 h-6" source={icons.edit} />
        </Pressable>
      </View>
      <View className="h-24 items-start justify-between w-full py-4">
        <Text className="text-lg font-MonMedium text-textPrimary capitalize">
          {username}
        </Text>
        <Text className="text-textSecondary">{Sub} Subscriber</Text>
      </View>
    </View>
  );
};

export default Header;
