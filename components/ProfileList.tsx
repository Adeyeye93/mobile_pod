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
  icon?: ImageSourcePropType;
  text: string;
  requireAction?: boolean;
  secondText?: string;
  toggle?: boolean;
  onPress?: () => void;
  selected?: string;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
}

const ProfileList = ({
  icon,
  text,
  secondText,
  toggle,
  requireAction = false,
  onPress,
  selected,
  toggleValue,
  onToggleChange,
}: ProfileListProp) => {
  return (
    <Pressable
      onPress={onPress}
      className="w-full h-14 flex-row items-center justify-between"
    >
      <View className="flex-row items-center justify-start h-full flex-1 gap-3 ">
        {icon && (
          <Image tintColor="#E4E7EC" className="w-7 h-7" source={icon} />
        )}
        <Text className="text-textPrimary font-MonBold relative">
          {text}
          {requireAction && (
            <View className="absolute w-2 h-2 bg-green-600 rounded-full z-10 right-0 top-0" />
          )}
        </Text>
        {secondText && (
          <Text className="text-textPrimary font-MonBold">{secondText}</Text>
        )}
      </View>
      <View className="flex flex-row gap-4">
        {selected && (
          <Text className="text-textPrimary font-MonMedium">{selected}</Text>
        )}
        {!toggle && <Image className="w-5 h-5" source={icons.redirect2} />}
        {toggle && (
          <ToggleButton
            size="small"
            value={toggleValue}
            onChange={onToggleChange}
          />
        )}
      </View>
    </Pressable>
  );
};

export default ProfileList;
