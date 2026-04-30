import { useEffect, useRef, useCallback, useState } from "react";
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from "expo-audio";

// Fallback polling interval when WebSocket segment_ready is not received
const POLL_INTERVAL_MS = 3_000;

type Quality = "low" | "medium" | "high";

interface HLSPlayerOptions {
  masterUrl: string;
  quality?: Quality;
  autoPlay?: boolean;
}

interface HLSPlayerState {
  isPlaying: boolean;
  isBuffering: boolean;
  isEnded: boolean;
  currentSegment: number;
  error: string | null;
}

export function useHLSPlayer({
  masterUrl,
  quality = "medium",
  autoPlay = true,
}: HLSPlayerOptions) {
  const playerRef = useRef<AudioPlayer | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playlistUrlRef = useRef<string | null>(null);
  const segmentQueueRef = useRef<string[]>([]);
  const playingRef = useRef(false);
  const lastSegmentNameRef = useRef<string | null>(null);
  const isEndedRef = useRef(false);

  const [state, setState] = useState<HLSPlayerState>({
    isPlaying: false,
    isBuffering: true,
    isEnded: false,
    currentSegment: 0,
    error: null,
  });

  // ---------------------------------------------------------------------------
  // Audio session — run once on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    });

    return () => {
      cleanup();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Step 1 — Resolve master playlist → bitrate playlist URL
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!masterUrl) return;
    resolveBitratePlaylist(masterUrl, quality);
  }, [masterUrl, quality]);

  const resolveBitratePlaylist = async (master: string, q: Quality) => {
    try {
      const res = await fetch(master);
      if (!res.ok)
        throw new Error(`Master playlist fetch failed: ${res.status}`);
      const text = await res.text();
      const url = parseBitrateUrl(master, text, q);
      playlistUrlRef.current = url;
      startPolling();
    } catch (err: any) {
      setState((prev) => ({ ...prev, error: err.message, isBuffering: false }));
    }
  };

  const parseBitrateUrl = (
    masterUrl: string,
    content: string,
    q: Quality,
  ): string => {
    const lines = content
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const qualityIndex = { low: 0, medium: 1, high: 2 }[q];
    const playlistLines = lines.filter((l) => !l.startsWith("#"));
    const chosen =
      playlistLines[qualityIndex] ?? playlistLines[1] ?? playlistLines[0];
    if (!chosen) throw new Error("No bitrate playlists found in master.m3u8");
    if (chosen.startsWith("http")) return chosen;
    const base = masterUrl.substring(0, masterUrl.lastIndexOf("/") + 1);
    return base + chosen;
  };

  // ---------------------------------------------------------------------------
  // Step 2 — Poll bitrate playlist for new segments
  // ---------------------------------------------------------------------------

  const startPolling = () => {
    if (pollTimerRef.current) return;
    fetchPlaylist();
    pollTimerRef.current = setInterval(fetchPlaylist, POLL_INTERVAL_MS);
  };

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const fetchPlaylist = useCallback(async () => {
    const url = playlistUrlRef.current;
    if (!url) return;

    try {
      const res = await fetch(`${url}?_=${Date.now()}`);
      if (!res.ok) return;
      const text = await res.text();
      const newSegments = parseSegmentUrls(url, text);
      enqueueNewSegments(newSegments);

      if (text.includes("#EXT-X-ENDLIST")) {
        stopPolling();
      }
    } catch {
      // Silent — retry on next poll
    }
  }, []);

  const parseSegmentUrls = (playlistUrl: string, content: string): string[] => {
    const lines = content
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const base = playlistUrl.substring(0, playlistUrl.lastIndexOf("/") + 1);
    return lines
      .filter((l) => !l.startsWith("#"))
      .map((l) => (l.startsWith("http") ? l : base + l));
  };

  const enqueueNewSegments = (segments: string[]) => {
    if (segments.length === 0) return;

    const lastKnown = lastSegmentNameRef.current;
    const newOnes = lastKnown
      ? segments.slice(segments.findIndex((s) => s.endsWith(lastKnown)) + 1)
      : segments;

    if (newOnes.length > 0) {
      lastSegmentNameRef.current =
        newOnes[newOnes.length - 1].split("/").pop() ?? null;
      segmentQueueRef.current = [...segmentQueueRef.current, ...newOnes];

      setState((prev) => ({ ...prev, isBuffering: false }));

      if (!playingRef.current && autoPlay) {
        playNextSegment();
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Step 3 — Play segments sequentially
  //
  // createAudioPlayer gives a persistent player instance.
  // player.replace(source) swaps the audio source without creating a new
  // player each time — lower overhead and cleaner segment chaining.
  // ---------------------------------------------------------------------------

  const playNextSegment = useCallback(async () => {
    const queue = segmentQueueRef.current;
    if (queue.length === 0) {
      playingRef.current = false;
      return;
    }

    playingRef.current = true;
    const url = queue.shift()!;
    segmentQueueRef.current = queue;

    try {
      if (!playerRef.current) {
        // First segment — create the player and attach the completion listener
        const player = createAudioPlayer({ uri: url });
        playerRef.current = player;

        player.addListener("playbackStatusUpdate", (status) => {
          if (status.didJustFinish && !isEndedRef.current) {
            setState((prev) => ({ ...prev, isPlaying: false }));
            playNextSegment();
          }
        });

        player.play();
      } else {
        // Subsequent segments — swap source on the existing player
        playerRef.current.replace({ uri: url });
        playerRef.current.play();
      }

      setState((prev) => ({
        ...prev,
        isPlaying: true,
        currentSegment: prev.currentSegment + 1,
      }));
    } catch (err: any) {
      console.warn("[HLSPlayer] Segment playback error:", err.message);
      playingRef.current = false;
      playNextSegment();
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Exposed controls
  // ---------------------------------------------------------------------------

  const pause = useCallback(() => {
    playerRef.current?.pause();
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    playerRef.current?.play();
    setState((prev) => ({ ...prev, isPlaying: true }));
  }, []);

  // Called by useStreamChannel's onSegmentReady — bypasses poll latency
  const onSegmentReady = useCallback(
    (urls: Record<Quality, string>) => {
      const url = urls[quality] ?? urls.medium ?? urls.low;
      if (!url) return;

      const segmentName = url.split("/").pop() ?? null;
      if (segmentName && segmentName === lastSegmentNameRef.current) return;

      lastSegmentNameRef.current = segmentName;
      segmentQueueRef.current = [...segmentQueueRef.current, url];

      setState((prev) => ({ ...prev, isBuffering: false }));

      if (!playingRef.current && autoPlay) {
        playNextSegment();
      }
    },
    [quality, playNextSegment, autoPlay],
  );

  const onStreamEnded = useCallback(() => {
    isEndedRef.current = true;
    setState((prev) => ({ ...prev, isEnded: true }));
  }, []);

  const cleanup = () => {
    stopPolling();
    if (playerRef.current) {
      playerRef.current.release();
      playerRef.current = null;
    }
  };

  return {
    ...state,
    pause,
    resume,
    onSegmentReady,
    onStreamEnded,
  };
}
