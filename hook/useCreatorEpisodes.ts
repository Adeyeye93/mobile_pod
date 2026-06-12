import { useCallback, useEffect, useState } from "react";
import { api } from "@/libs/api";
import { fixMediaUrl } from "@/utils/mediaUrl";

export interface CreatorEpisode {
  id: string;
  title: string;
  thumbnail_url: string | null;
  master_url: string;
  download_url?: string | null;
  duration_seconds: number;
  published_at: string;
}

export function useCreatorEpisodes(creatorId: string) {
  const [episodes, setEpisodes] = useState<CreatorEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!creatorId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`creators/${creatorId}/recordings`);
      const list = Array.isArray(res.data) ? res.data : (res.data.recordings ?? res.data.streams ?? []);
      setEpisodes(list.map((e: any) => ({ ...e, thumbnail_url: fixMediaUrl(e.thumbnail_url) })));
    } catch (err: any) {
      setError(err.message ?? "Failed to load episodes");
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    load();
  }, [load]);

  return { episodes, loading, error, refresh: load };
}
