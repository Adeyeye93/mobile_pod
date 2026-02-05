import {
  View,
  Text,
  ImageSourcePropType,
  Image,
  Pressable,
} from "react-native";
import React from "react";
import { icons } from "@/constants/icons";
import { ToggleButton } from "./ToggleBtn";

interface ProfileListProp {
  icon: ImageSourcePropType;
  text: string;
  secondText?: string;
  toggle?: boolean;
  onPress?: () => void ;
}

const ProfileList = ({ icon, text, secondText, toggle, onPress }: ProfileListProp) => {
  return (
    <Pressable onPress={onPress} className="w-full h-14 flex-row items-center justify-between">
      <View className="flex-row items-center justify-start h-full flex-1 gap-3 ">
        <Image tintColor="#E4E7EC" className="w-7 h-7" source={icon} />
        <Text className="text-textPrimary font-MonBold">{text}</Text>
        {secondText && (
          <Text className="text-textPrimary font-MonBold">{secondText}</Text>
        )}
      </View>
      {!toggle && <Image className="w-5 h-5" source={icons.redirect2} />}
      {toggle && <ToggleButton size='small' />}
    </Pressable>
  );
};

export default ProfileList;
