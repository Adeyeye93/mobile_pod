import { Text, Pressable } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const PodTitle = ({ id, title }: { id: string; title: string }) => {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(`/home/author/podcast/${id}`)}>
      <Text
        className="text-textPrimary font-MonBold text-xl capitalize"
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
    </Pressable>
  );
};

export default PodTitle;
