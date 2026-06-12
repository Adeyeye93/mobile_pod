import { useCallback, useEffect, useState } from "react";
import { api } from "@/libs/api";
import { fixMediaUrl } from "@/utils/mediaUrl";

export type MatchReason = "both" | "interest" | "location" | "none";

export interface SessionListener {
  user_id: string;
  username: string;
  avatar_url: string | null;
}

export interface ListeningSession {
  recording_id: string;
  title: string;
  thumbnail_url: string | null;
  master_url: string;
  creator_id: string;
  creator_name: string;
  duration_seconds: number;
  current_position_seconds: number;
  listener_count: number;
  listeners: SessionListener[];   // up to 4 preview avatars from backend
  match: MatchReason;             // backend-ranked relevance
}

export function useListeningSessions() {
  const [sessions, setSessions] = useState<ListeningSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await api.get("feed/listening-now");
      const raw: ListeningSession[] = res.data?.sessions ?? res.data ?? [];
      const data = raw.map((s) => ({
        ...s,
        thumbnail_url: fixMediaUrl(s.thumbnail_url),
        listeners: s.listeners.map((l) => ({ ...l, avatar_url: fixMediaUrl(l.avatar_url) })),
      }));
      setSessions(data);
    } catch (err: any) {
      if (!silent) setError(err?.message ?? "Failed to load");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 30_000);
    return () => clearInterval(interval);
  }, [load]);

  return { sessions, loading, error, refresh: load };
}
