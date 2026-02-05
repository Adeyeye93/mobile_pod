import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { useCreatorMode } from "@/context/CreatorModeContext";
import { LinearGradient } from "expo-linear-gradient";
import { images } from "@/constants/image";

export default function CreatorDashboard() {
  const { toggleCreatorMode } = useCreatorMode();

  return (
    <ScrollView
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        alignItems: "center",
        minHeight: 100,
      }}
      className="flex-1 bg-CreatorBG relative"
    >
      <View className="absolute top-0 left-0 inset-0 flex-col items-center justify-between h-screen w-screen">
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.3)",
            "rgba(255,255,255,0.1)",
            "rgba(26,26,46,1)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="h-3/5 w-screen"
        />
      </View>

      <View className="w-full h-28 mt-14 flex-row items-center justify-between px-4">
        <View className="h-full flex-1 flex-col items-start justify-evenly">
          <Text className="text-textPrimary font-MonBold text-2xl">
            Adeyeye
          </Text>
          <Text className="text-textPrimary font-MonBold text-2xl">Seyi</Text>
        </View>
        <View className="w-28 h-28 rounded-xl overflow-hidden">
          <Image className="w-full h-full" source={images.profile} />
        </View>
      </View>
      <View className="bg-gray-800 p-4 rounded-3xl shadow-xs mt-10 w-[90%] h-48"></View>
      <View className="w-[90%] h-80 mt-3 flex-row items-center justify-between">
        <View className="w-[49%] h-full bg-gray-800 rounded-3xl"></View>
        <View className="w-[49%] h-full bg-gray-800 rounded-3xl"></View>
      </View>
      <View className="bg-gray-800 p-4 rounded-3xl shadow-xs mt-3 w-[90%] h-48"></View>
      <View className="w-[90%] h-80 mt-3 flex-row items-center justify-between">
        <View className="w-[49%] h-full bg-gray-800 rounded-3xl"></View>
        <View className="w-[49%] h-full bg-gray-800 rounded-3xl"></View>
      </View>
    </ScrollView>
  );
}
