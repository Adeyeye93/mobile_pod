import { View, Text, Image, Pressable, ScrollView, ActivityIndicator } from 'react-native'
import React from 'react'
import PageHead from '@/components/PageHead';
import { useFollow } from '@/context/FollowContext';
import { useRouter } from 'expo-router';
import { icons } from '@/constants/icons';
import { images } from '@/constants/image';

const Subscriptions = () => {
  const { creators, loaded, unfollow } = useFollow();
  const router = useRouter();

  return (
    <View className="flex-1 bg-background px-4">
      <ScrollView
        className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30, minHeight: "100%" }}
      >
        <PageHead title="Subscriptions" has_link={true} />

        {!loaded && (
          <View className="flex-1 items-center justify-center mt-20">
            <ActivityIndicator size="large" color="#4169e1" />
          </View>
        )}

        {loaded && creators.length === 0 && (
          <View className="flex-1 items-center justify-center mt-20 px-8 gap-3">
            <Image className="w-16 h-16 opacity-30" tintColor="#6b7280" source={icons.pod} />
            <Text className="text-textSecondary font-MonBold text-base text-center">
              No subscriptions yet
            </Text>
            <Text className="text-gray-500 font-MonRegular text-sm text-center">
              Follow creators from their profile page and they'll appear here
            </Text>
          </View>
        )}

        {loaded && creators.map((creator) => (
          <Pressable
            key={creator.id}
            onPress={() => router.push(`/home/author/${creator.id}` as any)}
            className="flex-row items-center justify-between py-3 border-b border-white/5"
          >
            <View className="flex-row items-center gap-4 flex-1">
              <View className="relative">
                {creator.thumbnail_url ? (
                  <Image className="w-16 h-16 rounded-2xl" source={{ uri: creator.thumbnail_url }} />
                ) : (
                  <View className="w-16 h-16 rounded-2xl bg-primary/20 items-center justify-center">
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
    </View>
  );
}

export default Subscriptions
