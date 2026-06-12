import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import { useSearch } from "@/hook/useSearch";
import { useSearchHistory } from "@/hook/useSearchHistory";
import { useAudio } from "@/context/AudioPlayerContext";
import { usePlayer } from "@/context/PlayerContext";
import { useRouter } from "expo-router";
import type { Recording } from "@/hook/useRecordings";
import type { FeedChannelItem } from "@/hook/useFeed";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")} mins`;
}

const TermPill = ({
  name,
  onPress,
  onRemove,
}: {
  name: string;
  onPress: () => void;
  onRemove: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className="bg-[#a7a6a623] p-2 flex-row items-center gap-2 rounded"
  >
    <Text className="font-MonRegular text-textSecondary text-sm">{name}</Text>
    <Pressable onPress={onRemove} className="p-1 bg-[#a7a6a60d] rounded">
      <Image className="w-3 h-3" tintColor="#6b7280" source={icons.close} />
    </Pressable>
  </Pressable>
);

const ResultItem = ({
  item,
  onPlay,
}: {
  item: Recording;
  onPlay: (item: Recording) => void;
}) => {
  const { currentTrack, status } = useAudio();
  const isPlaying = currentTrack?.id === item.id && status.playing;

  return (
    <View className="w-full flex-row items-center gap-3">
      <Image
        source={item.thumbnail ? { uri: item.thumbnail } : images.podDefault}
        className="w-14 h-14 rounded-xl"
      />
      <View className="flex-1">
        <Text numberOfLines={1} className="text-textPrimary font-MonMedium">
          {item.title}
        </Text>
        <Text className="text-textSecondary font-MonRegular text-xs mt-0.5">
          {item.creator_name}
          {item.category ? ` · ${item.category}` : ""}
        </Text>
        {item.duration_seconds > 0 && (
          <Text className="text-gray-500 font-MonRegular text-xs mt-0.5">
            {formatDuration(item.duration_seconds)}
          </Text>
        )}
      </View>
      <Pressable
        onPress={() => onPlay(item)}
        className="p-2 bg-[#2a2f3a] rounded-full"
      >
        <Image
          className="w-5 h-5"
          tintColor={isPlaying ? "#fff" : "#6b7280"}
          source={isPlaying ? icons.pause : icons.play}
        />
      </Pressable>
    </View>
  );
};

const HistoryRecordingItem = ({
  item,
  onPlay,
  onRemove,
}: {
  item: Recording;
  onPlay: (item: Recording) => void;
  onRemove: (id: string) => void;
}) => (
  <View className="w-full flex-row items-center justify-between gap-3">
    <View className="flex-1 flex-row items-center gap-3">
      <Image
        source={item.thumbnail ? { uri: item.thumbnail } : images.podDefault}
        className="w-14 h-14 rounded-xl"
      />
      <View className="flex-1 border-l border-[#6b7280] pl-3">
        <Text
          numberOfLines={1}
          className="text-textSecondary font-MonMedium text-base"
        >
          {item.title}
        </Text>
        <Text
          numberOfLines={1}
          className="text-gray-500 font-MonMedium text-sm mt-0.5"
        >
          {item.creator_name}
        </Text>
      </View>
    </View>
    <View className="flex-row gap-3 items-center">
      <Pressable onPress={() => onPlay(item)}>
        <Image className="w-6 h-6" tintColor="#6b7280" source={icons.play} />
      </Pressable>
      <Pressable onPress={() => onRemove(item.id)}>
        <Image className="w-5 h-5" tintColor="#6b7280" source={icons.close} />
      </Pressable>
    </View>
  </View>
);

const ChannelItem = ({ item }: { item: FeedChannelItem }) => {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.navigate(`/home/author/${item.id}`)}
      className="flex-row items-center gap-3"
    >
      <Image
        source={item.thumbnail_url ? { uri: item.thumbnail_url } : images.chaDefault}
        className="w-12 h-12 rounded-full"
      />
      <View className="flex-1">
        <Text numberOfLines={1} className="text-textPrimary font-MonMedium">
          {item.name}
        </Text>
        <Text className="text-textSecondary font-MonRegular text-xs mt-0.5">
          {item.follower_count ?? 0} followers
          {item.is_live ? " · Live now" : ""}
        </Text>
      </View>
    </Pressable>
  );
};

const LoadingSkeleton = () => (
  <View className="gap-4 mt-4">
    {[0, 1, 2].map((i) => (
      <View key={i} className="flex-row items-center gap-3">
        <View className="w-14 h-14 rounded-xl bg-white/5" />
        <View className="flex-1 gap-2">
          <View className="h-3.5 rounded-full bg-white/5 w-4/5" />
          <View className="h-3 rounded-full bg-white/5 w-3/5" />
          <View className="h-3 rounded-full bg-white/5 w-2/5" />
        </View>
      </View>
    ))}
  </View>
);

const Search = ({ initialQuery = "" }: { initialQuery?: string }) => {
  const [query, setQuery] = useState(initialQuery);
  const { results, channels, loading, error } = useSearch(query);
  const { terms, recordings, addTerm, removeTerm, addRecording, removeRecording } =
    useSearchHistory();
  const { loadTrack, toggle, currentTrack } = useAudio();
  const { ref: playerRef } = usePlayer();

  const handlePlay = (item: Recording) => {
    addRecording(item);
    if (currentTrack?.id === item.id) {
      toggle();
    } else {
      loadTrack({
        id: item.id,
        title: item.title,
        creatorName: item.creator_name ?? "Unknown",
        thumbnail: item.thumbnail,
        creatorAvatar: item.creator_avatar,
        masterUrl: item.master_url,
        downloadUrl: (item as any).download_url ?? null,
        durationSeconds: item.duration_seconds,
      });
    }
    playerRef.current?.expand();
  };

  const handleSubmit = () => {
    if (query.trim()) addTerm(query.trim());
  };

  const isSearching = query.trim().length > 0;

  return (
    <View className="h-full">
      {/* Search Input */}
      <View className="border border-[#1f222b] mt-6 flex-row items-center h-16 rounded-3xl pl-6 bg-[#1f222b]">
        <Image tintColor="#6b7280" className="w-6 h-6" source={icons.search} />
        <TextInput
          className="flex-1 font-MonMedium h-full ml-4 text-textPrimary"
          placeholder="Looking for a particular Podcast?"
          placeholderTextColor="#6b7280"
          inputMode="search"
          returnKeyType="search"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")} className="pr-5">
            <Image
              className="w-4 h-4"
              tintColor="#6b7280"
              source={icons.close}
            />
          </Pressable>
        )}
      </View>

      {/* Not searching: show history */}
      {!isSearching && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30, gap: 0 }}
        >
          {/* Search term pills */}
          {terms.length > 0 && (
            <View className="mt-4">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: 10,
                  alignItems: "center",
                  paddingHorizontal: 4,
                }}
              >
                {terms.map((term) => (
                  <TermPill
                    key={term}
                    name={term}
                    onPress={() => setQuery(term)}
                    onRemove={() => removeTerm(term)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Recent recordings */}
          {recordings.length > 0 && (
            <View className="mt-6">
              <Text className="text-textSecondary font-MonBold text-xl mb-4">
                Recent Searches
              </Text>
              <View className="gap-5">
                {recordings.map((item) => (
                  <HistoryRecordingItem
                    key={item.id}
                    item={item}
                    onPlay={handlePlay}
                    onRemove={removeRecording}
                  />
                ))}
              </View>
            </View>
          )}

          {terms.length === 0 && recordings.length === 0 && (
            <View className="items-center mt-16">
              <Text className="text-textSecondary font-MonRegular text-sm">
                Search for podcasts, creators, or categories
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Searching: show results */}
      {isSearching && (
        <View className="flex-1 mt-2">
          <Text className="text-textSecondary font-MonBold text-xl mt-4 mb-2">
            Results
          </Text>

          {loading && <LoadingSkeleton />}

          {!loading && error && (
            <View className="items-center mt-10">
              <Text className="text-red-400 font-MonRegular text-sm text-center">
                {error}
              </Text>
            </View>
          )}

          {!loading && !error && results.length === 0 && channels.length === 0 && (
            <View className="items-center mt-10">
              <Text className="text-textSecondary font-MonRegular text-sm text-center">
                No results for "{query}"
              </Text>
            </View>
          )}

          {!loading && !error && (results.length > 0 || channels.length > 0) && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 16, paddingBottom: 30 }}
            >
              {channels.length > 0 && (
                <View className="gap-4">
                  <Text className="text-textSecondary font-MonBold text-base">
                    Creators
                  </Text>
                  {channels.map((item) => (
                    <ChannelItem key={item.id} item={item} />
                  ))}
                </View>
              )}

              {results.length > 0 && (
                <View className="gap-4">
                  {channels.length > 0 && (
                    <Text className="text-textSecondary font-MonBold text-base mt-2">
                      Episodes
                    </Text>
                  )}
                  {results.map((item) => (
                    <ResultItem key={item.id} item={item} onPlay={handlePlay} />
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

export default Search;
