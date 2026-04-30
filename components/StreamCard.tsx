import {
  useInviteSheet,
  useLiveRecorderSheet,
} from "@/context/CreateSheetContext";
import { useLiveNotification } from "@/context/LiveNotificationContext";
import { api } from "@/libs/api";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  PermissionsAndroid,
  Pressable,
  Text,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────
export type Participant = {
  id: string;
  name: string;
  avatar_url: string | null;
};

export type StreamParticipants = {
  host: Participant;
  guests: Participant[];
};

export type Stream = {
  id: string;
  title: string;
  category: string;
  description: string;
  scheduled_start_time: string;
  status: "scheduled" | "live" | "ended";
  is_private: boolean;
  viewer_count: number;
  thumbnail: string | null;
};

type StreamCardProps = {
  stream: Stream;
  participants: StreamParticipants | null;
};

// ─── Urgency ──────────────────────────────────────────────────────────────────
type Urgency = "normal" | "warn" | "urgent" | "critical" | "expired";

const URGENCY_ACCENT: Record<Urgency, string> = {
  normal: "#7986cb",
  warn: "#f59e0b",
  urgent: "#f97316",
  critical: "#e53935",
  expired: "#e53935",
};

// ─── Countdown hook ───────────────────────────────────────────────────────────
type CountdownState = {
  d: number;
  h: number;
  m: number;
  s: number;
  secondsLeft: number;
  urgency: Urgency;
  expired: boolean;
};

function useCountdown(iso: string): CountdownState {
  const getState = (): CountdownState => {
    const diff = new Date(iso).getTime() - Date.now();
    if (diff <= 0) {
      return {
        d: 0,
        h: 0,
        m: 0,
        s: 0,
        secondsLeft: 0,
        urgency: "expired",
        expired: true,
      };
    }
    const total = Math.floor(diff / 1000);
    const urgency: Urgency =
      total <= 5
        ? "critical"
        : total <= 120
          ? "urgent"
          : total <= 300
            ? "urgent"
            : total <= 600
              ? "warn"
              : "normal";

    return {
      d: Math.floor(total / 86400),
      h: Math.floor((total % 86400) / 3600),
      m: Math.floor((total % 3600) / 60),
      s: total % 60,
      secondsLeft: total,
      urgency,
      expired: false,
    };
  };

  const [state, setState] = useState<CountdownState>(getState);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = getState();
      setState(next);
      if (next.expired) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [iso]);

  return state;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({
  participant,
  size = 28,
  borderColor,
  style,
}: {
  participant: Participant;
  size?: number;
  borderColor?: string;
  style?: object;
}) {
  const initials =
    (participant.name ?? "")
      .trim()
      .split(" ")
      .map((w) => w[0] ?? "")
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: borderColor ?? "#12152a",
          overflow: "hidden",
          backgroundColor: "#2a2f55",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {participant.avatar_url ? (
        <Image
          source={{ uri: participant.avatar_url }}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      ) : (
        <Text
          className="font-MonMedium"
          style={{ fontSize: size * 0.33, color: "#fff", fontWeight: "700" }}
        >
          {initials}
        </Text>
      )}
    </View>
  );
}

// ─── Participants row ─────────────────────────────────────────────────────────
const MAX_VISIBLE = 3;

function ParticipantsRow({
  participants,
  accent,
}: {
  participants: StreamParticipants;
  accent: string;
}) {
  const { host, guests } = participants;
  const visible = guests.slice(0, MAX_VISIBLE);
  const overflow = guests.length - MAX_VISIBLE;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 14,
      }}
    >
      <View style={{ position: "relative", marginRight: 4 }}>
        <Avatar participant={host} size={30} borderColor={accent} />
        <View
          style={{
            position: "absolute",
            bottom: -3,
            alignSelf: "center",
            backgroundColor: accent,
            borderRadius: 4,
            paddingHorizontal: 3,
            paddingVertical: 1,
          }}
        >
          <Text
            className="font-MonBold"
            style={{ fontSize: 7, color: "#fff", fontWeight: "800" }}
          >
            HOST
          </Text>
        </View>
      </View>

      {visible.length > 0 && (
        <>
          <View
            style={{
              width: 1,
              height: 20,
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          />
          <View style={{ flexDirection: "row" }}>
            {visible.map((g, i) => (
              <Avatar
                key={g.id}
                participant={g}
                size={28}
                style={{ marginLeft: i === 0 ? 0 : -8 }}
              />
            ))}
            {overflow > 0 && (
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: "#12152a",
                  backgroundColor: "#1e2244",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: -8,
                }}
              >
                <Text
                  className="font-MonBold"
                  style={{ fontSize: 9, color: "#fff", fontWeight: "700" }}
                >
                  +{overflow}
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function InviteClosedTooltip({ visible }: { visible: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        opacity,
        position: "absolute",
        bottom: 38,
        right: 0,
        backgroundColor: "#1e2240",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.12)",
        zIndex: 20,
        minWidth: 130,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>
        Invites closed
      </Text>
      <Text
        style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 2 }}
      >
        Less than 1 hour left
      </Text>
      <View
        style={{
          position: "absolute",
          bottom: -5,
          right: 14,
          width: 8,
          height: 8,
          backgroundColor: "#1e2240",
          transform: [{ rotate: "45deg" }],
          borderRightWidth: 0.5,
          borderBottomWidth: 0.5,
          borderColor: "rgba(255,255,255,0.12)",
        }}
      />
    </Animated.View>
  );
}

// ─── Invite button ────────────────────────────────────────────────────────────
function InviteButton({
  disabled,
  onPress,
}: {
  disabled: boolean;
  onPress: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timer = useRef<NodeJS.Timeout>();

  const handlePress = () => {
    if (disabled) {
      setShowTooltip(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setShowTooltip(false), 2000);
    } else {
      onPress();
    }
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <View style={{ position: "relative" }}>
      <InviteClosedTooltip visible={showTooltip} />
      <Pressable
        onPress={handlePress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: disabled
            ? "rgba(255,255,255,0.08)"
            : "rgba(255,255,255,0.25)",
          backgroundColor: disabled
            ? "rgba(255,255,255,0.03)"
            : "rgba(255,255,255,0.08)",
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: disabled ? "rgba(255,255,255,0.2)" : "#fff",
          }}
        >
          {disabled ? "🔒 Invite" : "+ Invite"}
        </Text>
      </Pressable>
    </View>
  );
}

// ─── CountdownBlock ───────────────────────────────────────────────────────────
function CountdownBlock({
  value,
  unit,
  accent,
  expired,
}: {
  value: string;
  unit: string;
  accent: string;
  expired: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        paddingVertical: 10,
        backgroundColor: expired ? "rgba(229,57,53,0.08)" : `${accent}12`,
        borderWidth: 1,
        borderColor: expired ? "rgba(229,57,53,0.2)" : `${accent}20`,
      }}
    >
      <Text
        className="font-MonBold"
        style={{
          fontSize: 20,
          fontWeight: "800",
          color: expired ? "#e53935" : accent,
          fontVariant: ["tabular-nums"],
        }}
      >
        {value}
      </Text>
      <Text
        className="font-MonBold"
        style={{
          fontSize: 9,
          fontWeight: "500",
          marginTop: 2,
          color: expired ? "rgba(229,57,53,0.5)" : "rgba(255,255,255,0.3)",
        }}
      >
        {unit}
      </Text>
    </View>
  );
}

// ─── Start button ─────────────────────────────────────────────────────────────
function StartButton({ stream }: { stream: Stream }) {
  const { startCreatorStream, stopCreatorStream, isStreaming, mode } =
    useLiveNotification();
  const { ref: liveRecorderSheet } = useLiveRecorderSheet();
  const [loading, setLoading] = useState(false);

  const RTMP_HOST = process.env.EXPO_PUBLIC_RTMP_HOST ?? "10.0.2.2";
  const RTMP_PORT = 1935;

  // This card's stream is the one currently streaming
  const isThisStreamActive = isStreaming && mode === "creator_live";

  const handlePress = async () => {
    if (isThisStreamActive) {
      // Stop
      setLoading(true);
      try {
        await stopCreatorStream();
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      // 1. Mic permission
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: "Microphone Permission",
          message: "We need microphone access to broadcast",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;

      // 2. Fetch real stream key from backend
      const { data } = await api.get(`/streams/${stream.id}/stream_key`);
      const streamKey = data.stream_key;

      // 3. Open the recorder sheet
      liveRecorderSheet.current?.expand();

      // 4. Start via context — this wires up the notification + waveform
      await startCreatorStream({
        streamId: stream.id,
        title: stream.title,
        serverHost: RTMP_HOST,
        serverPort: RTMP_PORT,
        streamKey,
      });
    } catch (err: any) {
      console.error("[StartButton] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading}
      style={{
        backgroundColor: isThisStreamActive ? "#7f1d1d" : "#e53935",
        width: 80,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        opacity: loading ? 0.6 : 1,
      }}
    >
      <Text className="font-MonBold" style={{ color: "#fff", fontSize: 12 }}>
        {loading ? "..." : isThisStreamActive ? "Stop" : "Start"}
      </Text>
    </Pressable>
  );
}

// ─── StreamCard ───────────────────────────────────────────────────────────────
export function StreamCard({ stream, participants }: StreamCardProps) {
  const countdown = useCountdown(stream.scheduled_start_time);
  const { ref: inviteSheet, setData } = useInviteSheet();

  const isLive = stream.status === "live";
  const accent = URGENCY_ACCENT[countdown.urgency];
  const inviteDisabled = isLive || countdown.secondsLeft <= 3600;

  const handleInvite = () => {
    setData(stream.id);
    inviteSheet.current?.expand();
  };

  return (
    <View
      style={{
        backgroundColor: "#12152a",
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: countdown.expired
          ? "rgba(229,57,53,0.2)"
          : isLive
            ? "rgba(229,57,53,0.3)"
            : `${accent}30`,
      }}
    >
      {/* Banner */}
      <View
        style={{
          width: "100%",
          aspectRatio: 16 / 9,
          backgroundColor: "#0e1128",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {stream.thumbnail ? (
          <Image
            source={{ uri: stream.thumbnail }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ fontSize: 44, opacity: 0.1 }}>📡</Text>
        )}

        <View
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            right: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "rgba(0,0,0,0.55)",
              borderRadius: 2,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: isLive ? "#e53935" : accent,
              }}
            />
            <Text
              className="font-MonBold"
              style={{
                fontSize: 10,
                fontWeight: "600",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {isLive ? "Live" : "Scheduled"}
            </Text>
          </View>
          <InviteButton disabled={inviteDisabled} onPress={handleInvite} />
        </View>
      </View>

      {/* Body */}
      <View style={{ padding: 16 }}>
        {/* Category + privacy */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 5,
          }}
        >
          <Text
            className="font-MonBold"
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 1,
              textTransform: "uppercase",
              color: accent,
            }}
          >
            {stream.category}
          </Text>
          <View
            style={{
              backgroundColor: stream.is_private
                ? "rgba(229,57,53,0.12)"
                : "rgba(102,187,106,0.12)",
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <Text
              className="font-MonBold"
              style={{ fontSize: 9, fontWeight: "700", color: "white" }}
            >
              {stream.is_private ? "Private" : "Public"}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text
          numberOfLines={2}
          className="font-MonBold"
          style={{
            fontSize: 18,
            fontWeight: "800",
            color: "#fff",
            lineHeight: 24,
            marginBottom: 14,
          }}
        >
          {stream.title}
        </Text>

        {/* Participants + Start button */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {participants && (
            <ParticipantsRow participants={participants} accent={accent} />
          )}
          <StartButton stream={stream} />
        </View>

        {/* Countdown / live state */}
        {isLive ? (
          <Text style={{ color: "#e53935", fontWeight: "700", fontSize: 12 }}>
            ● Happening now
          </Text>
        ) : (
          <>
            <Text
              style={{
                fontSize: 9,
                fontWeight: "600",
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 8,
                color: countdown.expired
                  ? "rgba(229,57,53,0.5)"
                  : "rgba(255,255,255,0.3)",
              }}
            >
              {countdown.expired ? "Timer expired" : "Starts in"}
            </Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {countdown.d > 0 && (
                <CountdownBlock
                  value={String(countdown.d)}
                  unit="d"
                  accent={accent}
                  expired={countdown.expired}
                />
              )}
              <CountdownBlock
                value={pad(countdown.h)}
                unit="hr"
                accent={accent}
                expired={countdown.expired}
              />
              <CountdownBlock
                value={pad(countdown.m)}
                unit="min"
                accent={accent}
                expired={countdown.expired}
              />
              <CountdownBlock
                value={pad(countdown.s)}
                unit="sec"
                accent={accent}
                expired={countdown.expired}
              />
            </View>
          </>
        )}

        {/* Viewer count when live */}
        {isLive && (
          <Text
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 10,
              marginTop: 8,
            }}
          >
            {stream.viewer_count} watching
          </Text>
        )}
      </View>
    </View>
  );
}
