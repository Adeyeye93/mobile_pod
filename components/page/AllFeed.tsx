import {
  View,
  Text,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useFeed } from "@/hook/useFeed";
import { useListeningSessions } from "@/hook/useListeningSessions";
import FeedSection from "@/components/FeedSection";
import ListeningNow from "@/components/ListeningNow";
import { preloadOnWifi } from "@/utils/audioCache";
import type { FeedRecordingItem } from "@/hook/useFeed";

// Skeleton for a single section while loading
function SectionSkeleton({ wide }: { wide?: boolean }) {
  return (
    <View className="flex-1 h-fit mt-8">
      <View className="flex-row justify-between items-center">
        <View className="h-5 w-36 rounded-full bg-white/5" />
        <View className="h-4 w-12 rounded-full bg-white/5" />
      </View>
      <View className="flex-row gap-4 mt-5">
        {[0, 1, 2].map((i) => (
          <View key={i} className={`${wide ? "w-80 h-40" : "w-32 h-32"} rounded-3xl bg-white/5`} />
        ))}
      </View>
    </View>
  );
}

const AllFeed = () => {
  const { sections, loading, error, refresh } = useFeed();
  const { sessions, loading: sessionsLoading, refresh: refreshSessions } = useListeningSessions();
  const [refreshing, setRefreshing] = useState(false);

  // Preload top recording tracks on WiFi after feed loads
  useEffect(() => {
    if (loading || !sections.length) return;
    const recordings: FeedRecordingItem[] = [];
    for (const section of sections) {
      for (const item of section.items ?? []) {
        const r = item as FeedRecordingItem;
        if (r.download_url && r.master_url) recordings.push(r);
        if (recordings.length >= 5) break;
      }
      if (recordings.length >= 5) break;
    }
    recordings.forEach((r) => preloadOnWifi(r.id, r.download_url!).catch(() => {}));
  }, [loading, sections]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refresh(), refreshSessions()]);
    setRefreshing(false);
  }, [refresh, refreshSessions]);

  return (
    <ScrollView
      className="flex-1"
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 10, minHeight: "100%" }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
      }
    >
      <ListeningNow sessions={sessions} loading={sessionsLoading} />

      {/* Loading skeletons */}
      {loading && (
        <>
          <SectionSkeleton />
          <SectionSkeleton wide />
          <SectionSkeleton />
        </>
      )}

      {/* Error state */}
      {!loading && error && (
        <View className="mt-8 items-center">
          <Text className="text-textSecondary font-MonRegular text-sm">
            Could not load feed. Pull down to retry.
          </Text>
        </View>
      )}

      {/* Dynamic sections — backend decides order, titles, and content */}
      {!loading && sections.map((section) => (
        <FeedSection key={section.id} section={section} />
      ))}
    </ScrollView>
  );
};

export default AllFeed;
