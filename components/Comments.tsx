import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { icons } from "@/constants/icons";
import { useCommentsSheet } from "@/context/CreateSheetContext";

const Comments = ({ colors }: any) => {
  const { ref: sheetRef } = useCommentsSheet();

  return (
    <View
      className="w-full h-2/5 rounded-[1rem] overflow-hidden py-3 relative"
      style={{
        backgroundColor: colors?.colorTwo.value,
      }}
    >
      <View className="w-full h-8 flex-row items-center justify-between px-4">
        <Text className="text-textPrimary font-MonBold ">Comments</Text>
        <Pressable onPress={() => sheetRef.current?.expand()}>
          <Image className="w-6 h-6" source={icons.expand} />
        </Pressable>
      </View>
      <View className="h-20 absolute bottom-0 w-full flex-row items-center justify-center">
        <Text className="text-textSecondary font-MonBold ">
          No Comments Yet
        </Text>
      </View>
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(24,26,32,0.5)", "rgba(24,26,32,1)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="w-full h-full"
      />
    </View>
  );
};

export default Comments;
