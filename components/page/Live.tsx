import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { useState } from "react";
import Livecard from "@/components/livecard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const Live = () => {
    const [tab, setTab] = useState(1)
  return (
    <View className="mt-3 h-fit ">
      <View className="w-full h-20 bg-[#35383f] rounded-xl p-2 flex-row items-center justify-between relative">
        <View
          className={`absolute w-1/2 bg-primary h-full rounded-xl ml-2 mr-2 left-${tab}/2`}
        ></View>
        <Pressable
          onPress={() => setTab(2)}
          className="w-1/2 h-full items-center justify-center flex-row"
        >
          <Text className="text-textPrimary font-MonBold text-xl">
            All Live
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab(1)}
          className="w-1/2 h-full items-center justify-center flex-row"
        >
          <Text className="text-textPrimary font-MonBold text-xl">
            Following
          </Text>
        </Pressable>
      </View>
      <ScrollView
        snapToInterval={SCREEN_WIDTH * 0.9 + 16}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 200, minHeight: "100%" }}
      >
        <Livecard minimal IsSuggested />
        <Livecard minimal />
        <Livecard
          minimal
          IsSuggested
          Suggestion="BECAUSE YOU LISTENED TED TALK"
        />
        <Livecard minimal />
      </ScrollView>
    </View>
  );
};

export default Live;
