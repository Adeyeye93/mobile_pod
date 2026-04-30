import { useEffect, useRef, useState, useCallback } from "react";
import { usePhoenixChannel } from "@/libs/websoket";
import { getAuth } from "@/storage/authStorage";

const WS_URL =
  process.env.EXPO_PUBLIC_WS_URL || "ws://localhost:4000/socket/websocket";
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/api";

export interface LiveStream {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: "scheduled" | "live" | "ended";
  is_private: boolean;
  allow_comments: boolean;
  audio_quality: string;
  tags: string[] | null;
  thumbnail: string | null;
  language: string | null;
  viewer_count: number;
  peak_viewers: number;
  scheduled_start_time: string | null;
  actual_start_time: string | null;
  end_time: string | null;
  creator_id: string;
  channel_id: string;
  creator_name: string | null;
  creator_avatar: string | null;
  master_url: string;
}

export function useLiveStreams() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState("");
  

  useEffect(() => {
      (async () => {
        const stored = await getAuth();
        const token = stored?.accessToken ?? "";
        setToken(token);
      })();
    }, []);

  // ---------------------------------------------------------------------------
  // Phoenix feed channel — receives initial streams on join,
  // then updates in real time as streams start and end
  // ---------------------------------------------------------------------------

  const { isJoined, on } = usePhoenixChannel({
    url: WS_URL,
    topic: "feed:all",
    token: token ?? "",
    autoConnect: true,
  });

  useEffect(() => {
    if (!isJoined) return;

    // Server pushes current live streams as the join reply payload
    // usePhoenixChannel dispatches this as 'phx_join' with the response
    const offJoin = on("phx_join", (payload: { streams: LiveStream[] }) => {
      if (payload?.streams) {
        setStreams(payload.streams);
        setLoading(false);
      }
    });

    // New stream went live — prepend to list
    const offStarted = on(
      "stream_started",
      (payload: { stream: LiveStream }) => {
        setStreams((prev) => {
          // Avoid duplicates if somehow received twice
          const exists = prev.some((s) => s.id === payload.stream.id);
          if (exists) return prev;
          return [payload.stream, ...prev];
        });
      },
    );

    // Stream ended — remove from live list
    const offEnded = on("stream_ended", (payload: { stream_id: string }) => {
      setStreams((prev) => prev.filter((s) => s.id !== payload.stream_id));
    });

    // Viewer count updated — update in place
    const offViewerCount = on(
      "viewer_count_updated",
      (payload: { stream_id: string; count: number }) => {
        setStreams((prev) =>
          prev.map((s) =>
            s.id === payload.stream_id
              ? { ...s, viewer_count: payload.count }
              : s,
          ),
        );
      },
    );

    return () => {
      offJoin();
      offStarted();
      offEnded();
      offViewerCount();
    };
  }, [isJoined, on]);

  // ---------------------------------------------------------------------------
  // Fallback HTTP fetch — used only if WebSocket join payload has no streams
  // or if the channel fails to connect
  // ---------------------------------------------------------------------------

  const fetchStreams = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/streams/live`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStreams(data.streams ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // If channel join doesn't deliver streams within 3s, fall back to HTTP
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) fetchStreams();
    }, 3000);
    return () => clearTimeout(timer);
  }, [loading, fetchStreams]);

  const refresh = useCallback(() => fetchStreams(), [fetchStreams]);

  return { streams, loading, error, refresh };
}
