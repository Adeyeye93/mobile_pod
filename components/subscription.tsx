import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { images } from '@/constants/image'
import { useRouter } from 'expo-router'
import type { FeedChannelItem } from '@/hook/useFeed'
import { api } from '@/libs/api'

function useFollow(creatorId: string, initial: boolean) {
  const [isFollowing, setIsFollowing] = useState(initial);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    const prev = isFollowing;
    setIsFollowing(!prev); // optimistic
    try {
      if (prev) {
        await api.delete(`creators/${creatorId}/follow`);
      } else {
        await api.post(`creators/${creatorId}/follow`);
      }
    } catch {
      setIsFollowing(prev); // revert on error
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, toggle, loading };
}

function ChannelCard({
  item,
  showFollowButton,
}: {
  item: FeedChannelItem;
  showFollowButton?: boolean;
}) {
  const router = useRouter();
  const { isFollowing, toggle, loading } = useFollow(item.id, item.is_following ?? false);

  return (
    <View className="h-full w-32 flex flex-col justify-between">
      <Pressable onPress={() => router.push(`/home/author/${item.name}` as any)}>
        <View className="w-full h-32 rounded-3xl overflow-hidden">
          <Image
            source={item.thumbnail_url ? { uri: item.thumbnail_url } : images.thumbnail}
            className="w-full h-full"
          />
        </View>
        <View className="w-full mt-1">
          {item.is_live && (
            <Text className="text-primary font-MonRegular text-xs px-2">
              ● Live now
            </Text>
          )}
          <Text
            className="text-textPrimary font-MonBold text-xs px-2 capitalize"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.name}
          </Text>
          {item.follower_count != null && (
            <Text className="text-textSecondary font-MonRegular text-xs px-2">
              {item.follower_count >= 1000
                ? `${(item.follower_count / 1000).toFixed(1)}k`
                : `${item.follower_count}`}
            </Text>
          )}
        </View>
      </Pressable>

      {showFollowButton && (
        <Pressable
          onPress={toggle}
          disabled={loading}
          className={`mt-2 mx-1 py-1.5 rounded-xl items-center border ${
            isFollowing
              ? 'border-white/20 bg-transparent'
              : 'border-primary bg-primary/15'
          }`}
        >
          {loading ? (
            <ActivityIndicator size={10} color={isFollowing ? '#aaa' : '#e63946'} />
          ) : (
            <Text
              className={`font-MonBold text-[10px] ${
                isFollowing ? 'text-textSecondary' : 'text-primary'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

interface SubscriptionProps {
  items: FeedChannelItem[];
  showFollowButton?: boolean;
}

const Subscription = ({ items, showFollowButton }: SubscriptionProps) => {
  return (
    <View className='w-fit h-full flex flex-row justify-start items-center gap-4'>
      {items.map((item) => (
        <ChannelCard key={item.id} item={item} showFollowButton={showFollowButton} />
      ))}
    </View>
  );
};

export default Subscription;
