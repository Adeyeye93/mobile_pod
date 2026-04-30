import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { NativeEventEmitter, NativeModules } from "react-native";

const { AudioCapture } = NativeModules;
const emitter = new NativeEventEmitter(AudioCapture);

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode = "idle" | "creator_live" | "listener_live" | "listener_podcast";

type CreatorSession = {
  streamId: string;
  title: string;
  serverHost: string;
  serverPort: number;
  streamKey: string;
  sampleRate?: number;
  channels?: number;
  bitrate?: number;
};

type ListenerSession = {
  streamId: string;
  title: string;
  hostName: string;
  thumbnailUrl?: string;
  isLive: boolean;
  audioUrl?: string; // for podcast; live uses WebSocket/HLS
};

type LiveNotificationContextValue = {
  mode: Mode;
  elapsed: string; // creator: time streaming, listener live: stream duration
  waveform: number[]; // normalised [-1,1] points for the waveform line
  isMuted: boolean;
  isStreaming: boolean;
  currentSession: CreatorSession | ListenerSession | null;

  // Creator actions
  startCreatorStream: (session: CreatorSession) => Promise<void>;
  stopCreatorStream: () => Promise<void>;
  toggleMute: () => void;

  // Listener actions
  startListenerSession: (session: ListenerSession) => void;
  stopListenerSession: () => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────
const LiveNotificationContext =
  createContext<LiveNotificationContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function LiveNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<Mode>("idle");
  const [elapsed, setElapsed] = useState("00:00:00");
  const [waveform, setWaveform] = useState<number[]>(new Array(64).fill(0));
  const [isMuted, setIsMuted] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentSession, setCurrentSession] = useState<
    CreatorSession | ListenerSession | null
  >(null);

  // Listener elapsed timer (for live listening, backend doesn't push elapsed)
  const listenerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listenerSecondsRef = useRef(0);

  // ── Native event subscriptions ─────────────────────────────────────────────
  useEffect(() => {
    const subs = [
      // Elapsed from native (creator mode — driven by AudioCaptureModule)
      emitter.addListener("onElapsed", (value: string) => {
        if (mode === "creator_live") setElapsed(value);
      }),

      // Waveform points from native
      emitter.addListener("onWaveform", (points: number[]) => {
        setWaveform(points);
      }),

      // Mute toggled from notification action button
      emitter.addListener("onMuteChanged", (value: string) => {
        setIsMuted(value === "muted");
      }),

      // Stream ended from notification End button
      emitter.addListener("onStatus", (value: string) => {
        if (value === "Stream ended from notification") {
          setIsStreaming(false);
          setMode("idle");
          setCurrentSession(null);
          setElapsed("00:00:00");
          setWaveform(new Array(64).fill(0));
        }
      }),
    ];

    return () => subs.forEach((s) => s.remove());
  }, [mode]);

  // ── Creator: start stream ──────────────────────────────────────────────────
  const startCreatorStream = useCallback(async (session: CreatorSession) => {
    await AudioCapture.startCapture(
      session.sampleRate ?? 48000,
      session.channels ?? 1,
      session.bitrate ?? 192000,
      session.serverHost,
      session.serverPort,
      session.streamKey,
      session.title, // ← passed to notification
    );
    setCurrentSession(session);
    setMode("creator_live");
    setIsStreaming(true);
    setIsMuted(false);
    setElapsed("00:00:00");
  }, []);

  // ── Creator: stop stream ───────────────────────────────────────────────────
  const stopCreatorStream = useCallback(async () => {
    await AudioCapture.stopCapture();
    setIsStreaming(false);
    setMode("idle");
    setCurrentSession(null);
    setElapsed("00:00:00");
    setWaveform(new Array(64).fill(0));
  }, []);

  // ── Creator: mute toggle ───────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    AudioCapture.setMuted(next);
  }, [isMuted]);

  // ── Listener: start session ────────────────────────────────────────────────
  const startListenerSession = useCallback((session: ListenerSession) => {
    setCurrentSession(session);
    setMode(session.isLive ? "listener_live" : "listener_podcast");
    setElapsed("00:00:00");

    if (session.isLive) {
      // Count up elapsed for listener live mode
      listenerSecondsRef.current = 0;
      listenerTimerRef.current = setInterval(() => {
        listenerSecondsRef.current++;
        const t = listenerSecondsRef.current;
        const h = Math.floor(t / 3600);
        const m = Math.floor((t % 3600) / 60);
        const s = t % 60;
        setElapsed(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
        );
      }, 1000);
    }
  }, []);

  // ── Listener: stop session ─────────────────────────────────────────────────
  const stopListenerSession = useCallback(() => {
    if (listenerTimerRef.current) {
      clearInterval(listenerTimerRef.current);
      listenerTimerRef.current = null;
    }
    setMode("idle");
    setCurrentSession(null);
    setElapsed("00:00:00");
  }, []);

  return (
    <LiveNotificationContext.Provider
      value={{
        mode,
        elapsed,
        waveform,
        isMuted,
        isStreaming,
        currentSession,
        startCreatorStream,
        stopCreatorStream,
        toggleMute,
        startListenerSession,
        stopListenerSession,
      }}
    >
      {children}
    </LiveNotificationContext.Provider>
  );
}

export function useLiveNotification() {
  const ctx = useContext(LiveNotificationContext);
  if (!ctx)
    throw new Error(
      "useLiveNotification must be used within LiveNotificationProvider",
    );
  return ctx;
}
