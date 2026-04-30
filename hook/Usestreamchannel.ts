import { useEffect, useRef, useState, useCallback } from "react";
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
}

export function useStreamChannel({
  streamId,
  token,
  onSegmentReady,
  onStreamEnded,
  onViewerCount,
  onComment,
}: UseStreamChannelOptions) {
  const [streamState, setStreamState] = useState<StreamState | null>(null);
  const [recentComments, setRecentComments] = useState<StreamComment[]>([]);

  // Keep callbacks in refs so channel event handlers never go stale
  const onSegmentReadyRef = useRef(onSegmentReady);
  const onStreamEndedRef = useRef(onStreamEnded);
  const onViewerCountRef = useRef(onViewerCount);
  const onCommentRef = useRef(onComment);

  useEffect(() => {
    onSegmentReadyRef.current = onSegmentReady;
  }, [onSegmentReady]);
  useEffect(() => {
    onStreamEndedRef.current = onStreamEnded;
  }, [onStreamEnded]);
  useEffect(() => {
    onViewerCountRef.current = onViewerCount;
  }, [onViewerCount]);
  useEffect(() => {
    onCommentRef.current = onComment;
  }, [onComment]);

  const { isConnected, isJoined, connect, disconnect, push, on } =
    usePhoenixChannel({
      url: WS_URL,
      topic: `stream:${streamId}`,
      token,
      autoConnect: true,
    });

  // ---------------------------------------------------------------------------
  // Register event handlers once the channel is joined
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isJoined) return;

    // Initial state pushed by server on join
    const offStreamState = on("stream_state", (payload: StreamState) => {
      setStreamState(payload);
    });

    // Last 30 comments pushed by server on join
    const offRecentComments = on(
      "recent_comments",
      (payload: { comments: StreamComment[] }) => {
        setRecentComments(payload.comments ?? []);
      },
    );

    // New segment available — forward directly to HLS player
    const offSegmentReady = on(
      "segment_ready",
      (payload: SegmentReadyPayload) => {
        onSegmentReadyRef.current(payload);
      },
    );

    // Viewer count update
    const offViewerCount = on("viewer_count", (payload: { count: number }) => {
      setStreamState((prev) =>
        prev ? { ...prev, viewer_count: payload.count } : prev,
      );
      onViewerCountRef.current?.(payload.count);
    });

    // New comment broadcast to all listeners
    const offComment = on("new_comment", (payload: StreamComment) => {
      setRecentComments((prev) => [...prev, payload]);
      onCommentRef.current?.(payload);
    });

    // Stream ended — host disconnected or manually ended
    const offStreamEnded = on("stream_ended", () => {
      setStreamState((prev) => (prev ? { ...prev, status: "ended" } : prev));
      onStreamEndedRef.current();
    });

    // Guest accepted — useful if this listener is the host watching their own stream
    const offGuestAccepted = on("guest_accepted", (payload) => {
      console.log("[StreamChannel] Guest joined:", payload);
    });

    return () => {
      offStreamState();
      offRecentComments();
      offSegmentReady();
      offViewerCount();
      offComment();
      offStreamEnded();
      offGuestAccepted();
    };
  }, [isJoined, on]);

  // ---------------------------------------------------------------------------
  // Send a comment
  // ---------------------------------------------------------------------------

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
