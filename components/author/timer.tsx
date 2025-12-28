import { View, Text } from "react-native";
import React from "react";

let timeClass = "text-textSecondary font-MonRegular text-[11.5px]";


const Timer = () => {
  return (
    <View className="flex-row items-center gap-3">
      <Text className={timeClass}>9 hrs ago</Text>
      <Text className={timeClass}>|</Text>
      <Text className={timeClass}>52:27 mins</Text>
    </View>
  );
};

export default Timer;
