import { Text, Pressable } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const PodTitle = ({ title }: { title: string }) => {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(`/home/author/podcast/${title}`)}>
      <Text
        className="text-textPrimary font-MonBold text-xl"
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
    </Pressable>
  );
};

export default PodTitle;
