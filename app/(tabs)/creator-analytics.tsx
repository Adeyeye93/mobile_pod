import { View, Text, Image } from "react-native";
import { icons } from "@/constants/icons";

export default function CreatorAnalytics() {
  return (
    <View className="flex-1 bg-CreatorBG items-center justify-center gap-4 pb-20">
      <View className="w-16 h-16 rounded-full bg-white/5 items-center justify-center">
        <Image source={icons.analyticsH} className="w-8 h-8 opacity-40" />
      </View>
      <Text className="text-textPrimary font-MonBold text-xl">Analytics</Text>
      <Text className="text-textSecondary font-MonRegular text-sm text-center px-10">
        Detailed play counts, listener retention, and growth charts are on their way.
      </Text>
      <View className="bg-[#0f3460] px-5 py-2 rounded-full mt-2">
        <Text className="text-[#4a90e2] font-MonBold text-xs tracking-widest">
          COMING SOON
        </Text>
      </View>
    </View>
  );
}
