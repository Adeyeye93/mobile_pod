import { View, Text, Pressable, ScrollView } from "react-native";

export default function CreatorAnalytics() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6">
        <Text className="text-textPrimary font-MonBold text-3xl mb-6">
          Analytics
        </Text>

        {/* Time period selector */}
        <View className="flex-row gap-2 mb-6">
          {["Day", "Week", "Month"].map((period) => (
            <Pressable
              key={period}
              className="flex-1 bg-primary p-3 rounded-lg active:opacity-80"
            >
              <Text className="text-white font-MonMedium text-center text-sm">
                {period}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Analytics chart placeholder */}
        <View className="bg-gray-800 p-4 rounded-lg mb-6 h-64 justify-center items-center border border-gray-700">
          <Text className="text-textSecondary text-center">
            📊 Chart visualization will appear here
          </Text>
        </View>

        {/* Detailed stats */}
        <View className="gap-3 mb-6">
          <View className="bg-gray-800 p-4 rounded-lg flex-row justify-between items-center">
            <Text className="text-textSecondary font-MonMedium">
              Avg Watch Time
            </Text>
            <Text className="text-primary font-MonBold text-lg">5m 32s</Text>
          </View>
          <View className="bg-gray-800 p-4 rounded-lg flex-row justify-between items-center">
            <Text className="text-textSecondary font-MonMedium">
              Peak Viewers
            </Text>
            <Text className="text-primary font-MonBold text-lg">543</Text>
          </View>
          <View className="bg-gray-800 p-4 rounded-lg flex-row justify-between items-center">
            <Text className="text-textSecondary font-MonMedium">
              Engagement Rate
            </Text>
            <Text className="text-primary font-MonBold text-lg">12.3%</Text>
          </View>
          <View className="bg-gray-800 p-4 rounded-lg flex-row justify-between items-center">
            <Text className="text-textSecondary font-MonMedium">
              Total Views
            </Text>
            <Text className="text-primary font-MonBold text-lg">18.5K</Text>
          </View>
          <View className="bg-gray-800 p-4 rounded-lg flex-row justify-between items-center">
            <Text className="text-textSecondary font-MonMedium">
              Followers Gained
            </Text>
            <Text className="text-primary font-MonBold text-lg">+234</Text>
          </View>
        </View>

        {/* Top performing streams */}
        <Text className="text-textPrimary font-MonBold text-lg mb-4">
          Top Performing Streams
        </Text>
        <View className="gap-3">
          {[1, 2, 3].map((item) => (
            <View key={item} className="bg-gray-800 p-4 rounded-lg">
              <Text className="text-textPrimary font-MonBold">
                Stream {item} - Tech Talk
              </Text>
              <View className="flex-row justify-between mt-2">
                <Text className="text-textSecondary text-sm">Views: 2.1K</Text>
                <Text className="text-textSecondary text-sm">
                  Duration: 45m
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
