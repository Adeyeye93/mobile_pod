import { View, ScrollView, Dimensions } from "react-native";
import React from "react";
import type {
  FeedSection as FeedSectionType,
  FeedRecordingItem,
  FeedLiveItem,
  FeedChannelItem,
} from "@/hook/useFeed";
import type { Recording } from "@/hook/useRecordings";
import type { LiveStream } from "@/hook/useLiveStreams";
import SectionHeader from "@/components/SectionHeader";
import SecondHeader from "@/components/SecondHeader";
import Subscription from "@/components/subscription";
import PodList from "@/components/PodList";
import Livecard from "@/components/livecard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Adapters ────────────────────────────────────────────────────────────────

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

// ─── Section renderers ────────────────────────────────────────────────────────

function HorizontalChannels({
  items,
  showFollowButton,
}: {
  items: FeedChannelItem[];
  showFollowButton?: boolean;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-5"
    >
      <Subscription items={items} showFollowButton={showFollowButton} />
    </ScrollView>
  );
}

function RecordingList({ items }: { items: FeedRecordingItem[] }) {
  return <PodList data={items.map(toRecording)} />;
}

function LiveCardRow({ items }: { items: FeedLiveItem[] }) {
  return (
    <ScrollView
      horizontal
      snapToInterval={SCREEN_WIDTH * 0.9 + 16}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
      className="mt-2"
    >
      {items.map((item) => (
        <View key={item.id} style={{ width: SCREEN_WIDTH * 0.9 }}>
          <Livecard stream={toLiveStream(item)} />
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Build the in-app "see all" navigation URL ────────────────────────────────

function seeAllPath(title: string | null, type: string, see_all_route: string | null | undefined): string | undefined {
  if (!see_all_route) return undefined;
  const label = encodeURIComponent(title ?? type);
  return `/home/${label}?type=${encodeURIComponent(type)}&route=${encodeURIComponent(see_all_route)}`;
}

// ─── Main FeedSection ─────────────────────────────────────────────────────────

export default function FeedSection({ section }: { section: FeedSectionType }) {
  const { type, title, reason, see_all_route, channel, items } = section;

  if (!items || items.length === 0) return null;

  switch (type) {
    case "subscriptions":
      return (
        <View className="flex-1 h-fit mt-8">
          {title && (
            <SectionHeader
              title={title}
              action="See All"
              actionRoute={seeAllPath(title, type, see_all_route)}
            />
          )}
          {/* Already following — no follow button */}
          <HorizontalChannels items={items as FeedChannelItem[]} showFollowButton={false} />
        </View>
      );

    case "recordings":
    case "shows_you_might_like":
    case "episodes_you_might_like":
    case "recents":
    case "trending":
      return (
        <View className="flex-1 h-fit mt-8">
          {title && (
            <SectionHeader
              title={title}
              action="See All"
              actionRoute={seeAllPath(title, type, see_all_route)}
            />
          )}
          <RecordingList items={items as FeedRecordingItem[]} />
        </View>
      );

    case "channel_recommendation":
    case "popular_with_listeners_of":
      return (
        <View className="flex-1 h-fit mt-8">
          <SecondHeader
            topic={reason ?? title ?? "Because you listened to"}
            channel={channel?.name ?? ""}
            thumbnailUrl={channel?.thumbnail_url}
          />
          {/* Not yet following — show Follow button */}
          <HorizontalChannels items={items as FeedChannelItem[]} showFollowButton={true} />
        </View>
      );

    case "live_streams":
      return (
        <View className="flex-1 h-fit mt-8">
          {title && (
            <SectionHeader
              title={title}
              action="See All"
              actionRoute={seeAllPath(title, type, see_all_route)}
            />
          )}
          <LiveCardRow items={items as FeedLiveItem[]} />
        </View>
      );

    case "your_shows":
      return (
        <View className="flex-1 h-fit mt-8">
          {title && (
            <SectionHeader
              title={title}
              action="See All"
              actionRoute={seeAllPath(title, type, see_all_route)}
            />
          )}
          {/* Map your_shows items as recordings — title + thumbnail + episode count as creator */}
          <PodList
            data={items.map((item: any) => ({
              id: item.id,
              title: item.title,
              description: "",
              category: "",
              tags: [],
              thumbnail: item.thumbnail_url,
              language: "",
              audio_quality: "",
              duration_seconds: 0,
              segment_count: item.episode_count ?? 0,
              actual_start_time: item.last_published_at ?? "",
              end_time: "",
              creator_id: "",
              creator_name: `${item.episode_count ?? 0} episodes`,
              creator_avatar: null,
              peak_viewers: 0,
              master_url: "",
              download_url: null,
            } as Recording))}
          />
        </View>
      );

    default:
      return null;
  }
}
