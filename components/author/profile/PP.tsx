import { Pressable, Image } from "react-native";
import React from "react";
import { images } from "@/constants/image";
import { useRouter } from "expo-router";
import { useCreatorMode } from "@/context/CreatorModeContext";

interface PPInterface {
  size?: any;
}

const PP = ({ size = 10 }: PPInterface) => {
  const { isCreatorMode } = useCreatorMode()
  const router = useRouter()

  const Handle = () => {
    if (isCreatorMode) {
      router.push('/(tabs)/creator-profile')
    } else {
      router.push('/(tabs)/profile')
    }
     ;
  };

  return (
    <Pressable onPress={() => Handle()}>
      <Image source={images.profile} className={`h-${size} w-${size} rounded-full`} />
    </Pressable>
  );
};

export default PP;
