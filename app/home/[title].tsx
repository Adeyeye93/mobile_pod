import { View, Text, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import PageHead from "@/components/PageHead";
import PodList from "@/components/PodList";
import Livecard from "@/components/livecard";
import Subscription from "@/components/subscription";
import { api } from "@/libs/api";
import type { Recording } from "@/hook/useRecordings";
import type { LiveStream } from "@/hook/useLiveStreams";
import type { FeedChannelItem, FeedRecordingItem, FeedLiveItem } from "@/hook/useFeed";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function toRecording(item: FeedRecordingItem): Recording {
  return {
    id: item.id,
    title: item.title,
    description: "",
    category: "",
    tags: [],
    thumbnail: item.thumbnail_url,
    language: "",
    audio_quality: "",
    duration_seconds: item.duration_seconds,
    segment_count: 0,
    actual_start_time: item.published_at,
    end_time: "",
    creator_id: item.creator_id ?? "",
    creator_name: item.creator_name,
    creator_avatar: null,
    peak_viewers: 0,
    master_url: item.master_url,
    download_url: (item as any).download_url ?? null,
  };
}

function toLiveStream(item: FeedLiveItem): LiveStream {
  return {
    id: item.id,
    title: item.title,
    description: null,
    category: item.category ?? "",
    status: "live",
    is_private: false,
    allow_comments: true,
    audio_quality: "",
    tags: null,
    thumbnail: item.thumbnail_url ?? null,
    language: null,
    viewer_count: item.viewer_count,
    peak_viewers: item.viewer_count,
    scheduled_start_time: null,
    actual_start_time: item.started_at ?? item.actual_start_time ?? null,
    end_time: null,
    creator_id: "",
    channel_id: item.channel_id ?? "",
    creator_name: item.creator_name,
    creator_avatar: item.creator_avatar ?? null,
    master_url: item.master_url,
  };
}

function normaliseItems(data: any): any[] {
  if (Array.isArray(data)) return data;
  return (
    data?.items ??
    data?.recordings ??
    data?.streams ??
    data?.channels ??
    data?.data ??
    []
  );
}

export default function SeeAll() {
  const params = useLocalSearchParams<{ title: string; type: string; route: string }>();

  const displayTitle = decodeURIComponent(params.title ?? "");
  const sectionType = decodeURIComponent(params.type ?? "");
  const apiRoute = decodeURIComponent(params.route ?? "");

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!apiRoute) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(apiRoute);
      setItems(normaliseItems(res.data));
    } catch (err: any) {
      setError(err?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [apiRoute]);

  useEffect(() => { load(); }, [load]);

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center mt-20">
          <ActivityIndicator color="#e63946" />
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 items-center justify-center mt-20">
          <Text className="text-textSecondary font-MonRegular text-sm">
            Could not load. Pull down to retry.
          </Text>
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View className="flex-1 items-center justify-center mt-20">
          <Text className="text-textSecondary font-MonRegular text-sm">
            Nothing here yet.
          </Text>
        </View>
      );
    }

    if (sectionType === "live_streams") {
      return (
        <View className="gap-4 mt-4">
          {items.map((item) => (
            <Livecard key={item.id} stream={toLiveStream(item)} />
          ))}
        </View>
      );
    }

    if (sectionType === "subscriptions" || sectionType === "channel_recommendation") {
      return (
        <View className="mt-4">
          <Subscription items={items as FeedChannelItem[]} showFollowButton={sectionType !== "subscriptions"} />
        </View>
      );
    }

    // Default: recordings list
    return <PodList data={items.map(toRecording)} />;
  };

  return (
    <View className="flex-1 bg-background px-4">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <PageHead title={displayTitle} />
        {renderContent()}
      </ScrollView>
    </View>
  );
}
