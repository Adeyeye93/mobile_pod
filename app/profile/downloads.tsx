import PageHead from "@/components/PageHead";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function Downloads() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4">
        <PageHead title="Downloads" />
        <View className="flex-1 items-center justify-center gap-4">
          <Ionicons name="download-outline" size={56} color="rgba(255,255,255,0.15)" />
          <Text className="text-textSecondary font-MonMedium text-base">
            No downloads yet
          </Text>
          <Text className="text-white/25 font-MonRegular text-sm text-center px-8">
            Episodes you save for offline listening will appear here.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
