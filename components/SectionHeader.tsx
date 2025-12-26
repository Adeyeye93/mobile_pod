import { View, Text, Pressable } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

type SectionHeaderProps = {
  title: string;
  action: string;
  actionRoute?: string;
};

const SectionHeader = ({ title, action, actionRoute }: SectionHeaderProps) => {
  const router = useRouter();
  return (
    <View className="flex flex-row justify-between items-center">
      <Text className="text-textPrimary font-MonBold text-xl">{title}</Text>
      <Pressable onPress={() => actionRoute && router.push(actionRoute as any)}>
        <Text className="text-primary font-MonBold text-lg">{action}</Text>
      </Pressable>
    </View>
  );
};

export default SectionHeader;
