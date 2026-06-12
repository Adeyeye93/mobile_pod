import { View, Text, ScrollView, Pressable } from "react-native";
import { useMemo, useState } from "react";
import Livecard from "@/components/livecard";
import { useLiveStreams } from "@/hook/useLiveStreams";
import { useFollow } from "@/context/FollowContext";
import Preload from "../preload";

const Live = () => {
  const [tab, setTab] = useState<"all" | "following">("all");
  const { streams, loading, error, refresh } = useLiveStreams();
  const { creators: followedCreators } = useFollow();

  const followedIds = useMemo(
    () => new Set(followedCreators.map((c) => c.id)),
    [followedCreators]
  );

  const displayedStreams = useMemo(
    () =>
      tab === "following"
        ? streams.filter((s) => followedIds.has(s.creator_id))
        : streams,
    [tab, streams, followedIds]
  );

  return (
    <View className="mt-3 flex-1">
      {/* Tab switcher */}
      <View className="w-full h-20 bg-[#35383f] rounded-xl p-2 flex-row items-center justify-between relative">
        <View
          className={`absolute w-1/2 bg-primary h-full rounded-xl ml-2 mr-2 ${
            tab === "following" ? "left-1/2" : "left-0"
          }`}
        />
        <Pressable
          onPress={() => setTab("all")}
          className="w-1/2 h-full items-center justify-center"
        >
          <Text className="text-textPrimary font-MonBold text-xl">All Live</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("following")}
          className="w-1/2 h-full items-center justify-center"
        >
          <Text className="text-textPrimary font-MonBold text-xl">Following</Text>
        </Pressable>
      </View>

      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 200, minHeight: "100%" }}
      >
        {loading && (
          <View className="items-center mt-10">
            <Preload />
          </View>
        )}

        {!loading && error && (
          <Pressable className="items-center mt-10" onPress={refresh}>
            <Text className="text-textSecondary font-MonRegular">
              Failed to load streams. Tap to retry.
            </Text>
          </Pressable>
        )}

        {!loading && !error && displayedStreams.length === 0 && (
          <View className="items-center mt-10 px-6">
            <Text className="text-textSecondary font-MonRegular text-center">
              {tab === "following"
                ? followedCreators.length === 0
                  ? "Follow some creators to see their live streams here."
                  : "None of the creators you follow are live right now."
                : "No live streams right now."}
            </Text>
          </View>
        )}

        {displayedStreams.map((stream) => (
          <Livecard key={stream.id} stream={stream} minimal />
        ))}
      </ScrollView>
    </View>
  );
};

export default Live;
