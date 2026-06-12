import { View, Text, Image, Pressable, ScrollView } from "react-native";
import { useFollow } from "@/context/FollowContext";
import { useRouter } from "expo-router";
import { icons } from "@/constants/icons";

export default function Author({ searchQuery = "" }: { searchQuery?: string }) {
  const { creators, unfollow } = useFollow();
  const router = useRouter();
  const filtered = searchQuery
    ? creators.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : creators;

  if (filtered.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-3 px-8">
        <Image className="w-16 h-16 opacity-30" tintColor="#6b7280" source={icons.pod} />
        <Text className="text-textSecondary font-MonBold text-base text-center">
          No followed creators yet
        </Text>
        <Text className="text-gray-500 font-MonRegular text-sm text-center">
          Follow creators from their profile page and they'll appear here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 4, paddingHorizontal: 16, paddingBottom: 30 }}
    >
      {filtered.map((creator) => (
        <Pressable
          key={creator.id}
          onPress={() => router.navigate(`/home/author/${creator.id}`)}
          className="flex-row items-center justify-between py-3"
        >
          <View className="flex-row items-center gap-4 flex-1">
            <View className="relative">
              {creator.thumbnail_url ? (
                <Image className="w-14 h-14 rounded-full" source={{ uri: creator.thumbnail_url }} />
              ) : (
                <View className="w-14 h-14 rounded-full bg-primary/20 items-center justify-center">
                  <Text className="text-primary font-MonBold text-xl">
                    {(creator.name ?? "?")[0].toUpperCase()}
                  </Text>
                </View>
              )}
              {creator.is_live && (
                <View className="absolute -bottom-1 -right-1 bg-red-500 rounded-full px-1.5 py-0.5">
                  <Text className="text-white font-MonBold text-[9px]">LIVE</Text>
                </View>
              )}
            </View>
            <View className="flex-1">
              <Text numberOfLines={1} className="text-textPrimary font-MonBold text-base">
                {creator.name}
              </Text>
              <Text className="text-gray-500 font-MonRegular text-xs mt-0.5">
                {creator.follower_count
                  ? `${creator.follower_count.toLocaleString()} followers`
                  : "Creator"}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => unfollow(creator.id)}
            className="border border-[#2a2f3a] rounded-full px-4 py-2"
          >
            <Text className="text-textSecondary font-MonMedium text-xs">Following</Text>
          </Pressable>
        </Pressable>
      ))}
    </ScrollView>
  );
}
