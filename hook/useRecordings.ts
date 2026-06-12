import { useCallback, useEffect, useState } from "react";
import { api } from "@/libs/api";
import { fixMediaUrl } from "@/utils/mediaUrl";

export interface Recording {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string | null;
  language: string;
  audio_quality: string;
  duration_seconds: number;
  segment_count: number;
  actual_start_time: string;
  end_time: string;
  creator_id: string;
  creator_name: string;
  creator_avatar: string | null;
  peak_viewers: number;
  master_url: string;
  download_url: string | null;
}

export function useRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("streams/recorded");
      const json = res.data;
      const list: Recording[] = Array.isArray(json) ? json : (json.streams ?? []);

      // Rewrite any localhost URLs so the device can reach the dev server
      const fixed = list.map((r) => ({
        ...r,
        master_url: fixMediaUrl(r.master_url) ?? r.master_url,
        download_url: fixMediaUrl(r.download_url),
        thumbnail: fixMediaUrl(r.thumbnail),
        creator_avatar: fixMediaUrl(r.creator_avatar),
      }));

      setRecordings(fixed);
    } catch (err: any) {
      console.error("[useRecordings] fetch error:", err);
      setError(err.message ?? "Failed to load recordings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { recordings, loading, error, refresh: load };
}
