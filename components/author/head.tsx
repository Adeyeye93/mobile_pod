import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { icons } from '@/constants/icons';
import { images } from '@/constants/image';
import { useFollow } from '@/context/FollowContext';
import { useToast } from '@/context/FlashMessageContext';
import { shareChannel } from '@/utils/share';

interface HeadProps {
  creatorId: string;
  channelName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  followerCount?: number;
  isFollowing?: boolean;
  recordingCount?: number;
  onFollowChange?: (val: boolean) => void;
}

const Head = ({
  creatorId,
  channelName,
  bio,
  avatarUrl,
  followerCount = 0,
  isFollowing: initialFollowing = false,
  recordingCount,
  onFollowChange,
}: HeadProps) => {
  const [expanded, setExpanded] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const { follow, unfollow, isFollowing: ctxIsFollowing, loaded } = useFollow();
  const { show } = useToast();

  const avatarSource = avatarUrl ? { uri: avatarUrl } : images.chaDefault;
  // Use context once loaded; fall back to prop during initial fetch
  const isFollowing = loaded ? ctxIsFollowing(creatorId) : initialFollowing;

  const toggleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    onFollowChange?.(!isFollowing);
    try {
      if (isFollowing) {
        await unfollow(creatorId);
        show({ title: "Unfollowed", message: `You unfollowed ${channelName}.`, type: "info" });
      } else {
        await follow({ id: creatorId, name: channelName, thumbnail_url: avatarUrl ?? null, follower_count: followerCount });
        show({ title: "Following!", message: `You're now following ${channelName}.`, type: "success" });
      }
    } catch {
      onFollowChange?.(isFollowing);
      show({ title: "Something went wrong", message: "Could not update follow status.", type: "danger" });
    } finally {
      setFollowLoading(false);
    }
  };

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

  return (
    <View className="w-full h-fit flex justify-between items-center flex-col">
      <View className="h-52 w-full flex flex-row items-center justify-between">
        <View className="w-36 h-36 rounded-[20px] overflow-hidden">
          <Image source={avatarSource} className="h-full w-full" resizeMode="cover" />
        </View>
        <View className="flex-1 h-40 flex flex-col items-start justify-between p-3">
          <Text numberOfLines={1} className="text-textPrimary font-MonBold text-xl">
            {channelName || "Channel"}
          </Text>
          <View className="flex-row items-center gap-3">
            {recordingCount != null && (
              <Text className="text-textSecondary text-sm font-MonRegular">
                {recordingCount} Episodes
              </Text>
            )}
            <Text className="text-textSecondary text-sm font-MonRegular">
              {formatCount(followerCount)} followers
            </Text>
          </View>
          <View className="w-full h-16 flex-row items-center justify-start gap-4">
            <Pressable
              onPress={toggleFollow}
              disabled={followLoading}
              className={`${
                isFollowing
                  ? "w-36 bg-transparent border border-primary"
                  : "w-32 bg-primary"
              } h-10 rounded-full flex flex-row items-center justify-center gap-2`}
            >
              {followLoading ? (
                <ActivityIndicator size={14} color={isFollowing ? '#4169e1' : '#fff'} />
              ) : (
                <>
                  <Image
                    source={isFollowing ? icons.selected : icons.plus}
                    className="h-3 w-3"
                    tintColor={isFollowing ? "#4169e1" : "#ffffff"}
                  />
                  <Text className={`${isFollowing ? "text-primary" : "text-textPrimary"} font-MonMedium leading-10`}>
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                </>
              )}
            </Pressable>
            <Pressable onPress={() => shareChannel(creatorId, channelName)}>
              <Image source={icons.shareH} className="h-6 w-6" tintColor="#9ca3af" />
            </Pressable>
          </View>
        </View>
      </View>

      {bio ? (
        <Pressable onPress={() => setExpanded(!expanded)}>
          <Text
            numberOfLines={expanded ? 0 : 3}
            className="text-textSecondary text-sm leading-relaxed font-MonRegular"
          >
            {bio}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default Head;
