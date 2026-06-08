import { useCallback, useEffect, useState } from "react";
import { api } from "@/libs/api";

export interface FeedChannelItem {
  id: string;
  name: string;
  thumbnail_url: string | null;
  is_live?: boolean;
  follower_count?: number;
  is_following?: boolean;
}

export interface FeedRecordingItem {
  id: string;
  title: string;
  creator_name: string;
  creator_id: string;
  thumbnail_url: string | null;
  master_url: string;
  duration_seconds: number;
  published_at: string;
  progress_seconds?: number;
}

export interface FeedLiveItem {
  id: string;
  title: string;
  creator_name: string;
  creator_avatar?: string | null;
  thumbnail_url?: string | null;
  viewer_count: number;
  started_at?: string;
  actual_start_time?: string;
  master_url: string;
  channel_id?: string;
  category?: string;
}

export type FeedSectionType =
  | "subscriptions"
  | "recordings"
  | "shows_you_might_like"
  | "channel_recommendation"
  | "live_streams"
  | "your_shows"
  | "episodes_you_might_like"
  | "recents"
  | "popular_with_listeners_of"
  | "trending";

export interface FeedSection {
  id: string;
  type: FeedSectionType;
  title: string | null;
  subtitle?: string | null;
  reason?: string | null;
  see_all_route?: string | null;
  max_items?: number;
  channel?: { name: string; thumbnail_url: string | null } | null;
  items: any[];
}

export function useFeed() {
  const [sections, setSections] = useState<FeedSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("feed/home");
      const data: FeedSection[] = Array.isArray(res.data)
        ? res.data
        : (res.data.sections ?? []);
      setSections(data);
    } catch (err: any) {
      setError(err.message ?? "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { sections, loading, error, refresh: load };
}
