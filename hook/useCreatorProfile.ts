import { useCallback, useEffect, useState } from "react";
import { api } from "@/libs/api";
import { fixMediaUrl } from "@/utils/mediaUrl";

export interface CreatorProfile {
  id: string;
  channel_name: string;
  bio: string | null;
  avatar_url: string | null;
  follower_count: number;
  is_following: boolean;
  recording_count: number;
}

export function useCreatorProfile(creatorId: string) {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!creatorId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`creators/${creatorId}`);
      const d = res.data.creator ?? res.data;
      setProfile({
        id: d.id,
        channel_name: d.channel_name ?? d.name ?? "",
        bio: d.bio ?? null,
        avatar_url: fixMediaUrl(d.avatar_url ?? d.avatar),
        follower_count: d.follower_count ?? 0,
        recording_count: d.recording_count ?? 0,
        is_following: d.is_following ?? false,
      });
    } catch (err: any) {
      setError(err.message ?? "Failed to load creator");
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateFollowing = (val: boolean) =>
    setProfile((p) => p ? { ...p, is_following: val, follower_count: p.follower_count + (val ? 1 : -1) } : p);

  return { profile, loading, error, refresh: load, updateFollowing };
}
