import { useCallback, useEffect, useState } from "react";
import { api } from "@/libs/api";

// Strip /api suffix to get the raw server root, e.g. "http://10.0.2.2:4000"
const API_ROOT = (process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:4000/api/")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

// Backend returns localhost URLs — rewrite them so the device can reach the server
function rewriteLocalhost(url: string | null): string | null {
  if (!url) return null;
  return url.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, API_ROOT);
}

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
        master_url: rewriteLocalhost(r.master_url) ?? r.master_url,
        thumbnail: rewriteLocalhost(r.thumbnail),
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
