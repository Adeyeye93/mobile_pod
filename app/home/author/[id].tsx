import { View, ScrollView, TextInput, Image, Text } from "react-native";
import { useState, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import PageHead from "@/components/PageHead";
import Head from "@/components/author/head";
import Divider from "@/components/divider";
import AuthorListHead from "@/components/author/authorListHead";
import Pods from "@/components/author/pods";
import SortFilterE, { SortFilterProvider, useSortFilter } from "@/components/modals/Sort";
import { icons } from "@/constants/icons";
import { useImageColors } from "@/hook/useImageColors";
import { useCreatorProfile } from "@/hook/useCreatorProfile";
import { useCreatorEpisodes } from "@/hook/useCreatorEpisodes";
import { images } from "@/constants/image";

// ─── Skeletons ────────────────────────────────────────────────────────────────

function HeaderSkeleton() {
  return (
    <View className="w-full h-52 flex-row items-center justify-between mt-2">
      <View className="w-36 h-36 rounded-[20px] bg-white/5" />
      <View className="flex-1 h-40 p-3 gap-4 justify-center">
        <View className="h-6 w-40 rounded-full bg-white/5" />
        <View className="h-4 w-28 rounded-full bg-white/5" />
        <View className="h-10 w-32 rounded-full bg-white/5" />
      </View>
    </View>
  );
}

function EpisodeSkeleton() {
  return (
    <View className="flex-row items-center gap-3 py-4">
      <View className="w-14 h-14 rounded-2xl bg-white/5" />
      <View className="flex-1 gap-2">
        <View className="h-4 w-3/4 rounded-full bg-white/5" />
        <View className="h-3 w-1/2 rounded-full bg-white/5" />
      </View>
      <View className="w-8 h-8 rounded-full bg-white/5" />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

function AuthorContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { profile, loading: profileLoading, updateFollowing } = useCreatorProfile(id ?? "");
  const { episodes, loading: episodesLoading } = useCreatorEpisodes(id ?? "");
  const { sortBy } = useSortFilter();

  const bannerImage = profile?.avatar_url ? { uri: profile.avatar_url } : images.chaDefault;
  const colors = useImageColors(bannerImage);

  const filteredEpisodes = useMemo(() => {
    let list = [...episodes];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const ta = new Date(a.published_at).getTime();
      const tb = new Date(b.published_at).getTime();
      return sortBy === "oldest" ? ta - tb : tb - ta;
    });
    return list;
  }, [episodes, searchQuery, sortBy]);

  return (
    <View className="flex-1 bg-background px-4">
      <View
        className="absolute top-0 h-2/5 left-0 right-0 z-0 overflow-hidden"
        style={{ backgroundColor: colors?.colorOne.value }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(24,26,32,0.5)", "rgba(24,26,32,1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="w-full h-full"
        />
      </View>

      <PageHead
        title={profile?.channel_name ?? "Channel"}
        customIcons={[
          {
            icon: icons.search,
            onPress: () => {
              setSearchVisible((v) => !v);
              if (searchVisible) setSearchQuery("");
            },
            testID: "search-btn",
          },
        ]}
      />

      {searchVisible && (
        <View className="mb-3 flex-row items-center bg-white/8 rounded-xl px-3 py-2 border border-white/10">
          <Image source={icons.search} className="w-4 h-4 mr-2 opacity-50" />
          <TextInput
            autoFocus
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search episodes..."
            placeholderTextColor="#ffffff50"
            className="flex-1 text-textPrimary font-MonRegular text-sm"
          />
        </View>
      )}

      {profileLoading ? (
        <HeaderSkeleton />
      ) : profile ? (
        <Head
          creatorId={profile.id}
          channelName={profile.channel_name}
          bio={profile.bio}
          avatarUrl={profile.avatar_url}
          followerCount={profile.follower_count}
          isFollowing={profile.is_following}
          recordingCount={profile.recording_count}
          onFollowChange={updateFollowing}
        />
      ) : null}

      <AuthorListHead episodeCount={filteredEpisodes.length} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {episodesLoading ? (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i}>
                <Divider value={385} gap={25} />
                <EpisodeSkeleton />
              </View>
            ))}
          </>
        ) : filteredEpisodes.length === 0 ? (
          <View className="py-10 items-center">
            <Text className="text-textSecondary font-MonRegular text-sm">
              {searchQuery ? "No episodes match your search" : "No episodes yet"}
            </Text>
          </View>
        ) : (
          filteredEpisodes.map((episode) => (
            <View key={episode.id}>
              <Divider value={385} gap={25} />
              <Pods
                episode={episode}
                creatorId={profile?.id ?? ""}
                creatorName={profile?.channel_name ?? ""}
                creatorAvatar={profile?.avatar_url}
              />
            </View>
          ))
        )}
      </ScrollView>

      <SortFilterE />
    </View>
  );
}

const Author = () => (
  <SortFilterProvider>
    <AuthorContent />
  </SortFilterProvider>
);

export default Author;
