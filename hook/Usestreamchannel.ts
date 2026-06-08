import { useCallback, useEffect, useRef, useState } from "react";
import { usePhoenixChannel } from "@/libs/websoket";

const WS_URL =
  process.env.EXPO_PUBLIC_WS_URL || "ws://localhost:4000/socket/websocket";

type Quality = "low" | "medium" | "high";

export interface SegmentReadyPayload {
  segment: number;
  urls: Record<Quality, string>;
}

export interface StreamComment {
  id: string;
  text: string;
  likes: number;
  creator_id: string;
  creator_name: string | null;
  creator_avatar: string | null;
  inserted_at: string;
}

export interface StreamState {
  status: "scheduled" | "live" | "ended";
  viewer_count: number;
  title: string;
}

interface UseStreamChannelOptions {
  streamId: string;
  token: string;
  onSegmentReady: (payload: SegmentReadyPayload) => void;
  onStreamEnded: () => void;
  onViewerCount?: (count: number) => void;
  onComment?: (comment: StreamComment) => void;
  autoConnect?: boolean;
}

export function useStreamChannel({
  streamId,
  token,
  onSegmentReady,
  onStreamEnded,
  onViewerCount,
  onComment,
  autoConnect = true,
}: UseStreamChannelOptions) {
  const [streamState, setStreamState] = useState<StreamState | null>(null);
  const [recentComments, setRecentComments] = useState<StreamComment[]>([]);

  // Keep callbacks in refs so channel event handlers never go stale
  const onSegmentReadyRef = useRef(onSegmentReady);
  const onStreamEndedRef = useRef(onStreamEnded);
  const onViewerCountRef = useRef(onViewerCount);
  const onCommentRef = useRef(onComment);

  useEffect(() => { onSegmentReadyRef.current = onSegmentReady; }, [onSegmentReady]);
  useEffect(() => { onStreamEndedRef.current = onStreamEnded; }, [onStreamEnded]);
  useEffect(() => { onViewerCountRef.current = onViewerCount; }, [onViewerCount]);
  useEffect(() => { onCommentRef.current = onComment; }, [onComment]);

  const { isConnected, isJoined, connect, disconnect, push, on } =
    usePhoenixChannel({
      url: WS_URL,
      topic: `stream:${streamId}`,
      token,
      autoConnect,
      // Handle all state-updating events via onMessage so they fire immediately
      // when the server pushes data after join — before isJoined effect can run.
      onMessage: (event, payload) => {
        switch (event) {
          case "stream_state":
            setStreamState(payload as StreamState);
            break;
          case "recent_comments":
            setRecentComments((payload as { comments: StreamComment[] }).comments ?? []);
            break;
          case "viewer_count": {
            const count = (payload as { count: number }).count;
            setStreamState((prev) => prev ? { ...prev, viewer_count: count } : prev);
            onViewerCountRef.current?.(count);
            break;
          }
          case "new_comment": {
            const comment = payload as StreamComment;
            setRecentComments((prev) => [...prev, comment]);
            onCommentRef.current?.(comment);
            break;
          }
          case "stream_ended":
            setStreamState((prev) => prev ? { ...prev, status: "ended" } : prev);
            onStreamEndedRef.current();
            break;
          case "segment_ready":
            onSegmentReadyRef.current(payload as SegmentReadyPayload);
            break;
        }
      },
    });

  const sendComment = useCallback(
    (text: string) => {
      push("new_comment", { text });
    },
    [push],
  );

  return {
    isConnected,
    isJoined,
    streamState,
    recentComments,
    sendComment,
    connect,
    disconnect,
  };
}
