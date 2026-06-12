import { icons } from "@/constants/icons";
import {
  LiveRecorderSheetContext,
  Sheet,
  useLiveRecorderSheet,
} from "@/context/CreateSheetContext";
import { useLiveNotification } from "@/context/LiveNotificationContext";
import { useStreamChannel } from "@/hook/Usestreamchannel";
import { getAuth } from "@/storage/authStorage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { WaveformRecorder } from "../WaveformLine";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  Image,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { shareLive } from "@/utils/share";
import Comment from "../Comment";
import PageHead from "../PageHead";

// ─── Control button ───────────────────────────────────────────────────────────
function CtrlBtn({
  icon,
  label,
  onPress,
  danger = false,
  active = false,
  primary = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
  active?: boolean;
  primary?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={{ alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: primary ? 56 : 44,
          height: primary ? 56 : 44,
          borderRadius: primary ? 28 : 22,
          backgroundColor: danger
            ? "#7f1d1d"
            : active
              ? "rgba(229,57,53,0.2)"
              : "rgba(255,255,255,0.08)",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: active ? 1 : 0,
          borderColor: active ? "rgba(229,57,53,0.4)" : "transparent",
        }}
      >
        {icon}
      </View>
      <Text
        style={{
          fontSize: 10,
          color: primary
            ? "rgba(255,255,255,0.8)"
            : active
              ? "#ef5350"
              : "rgba(255,255,255,0.4)",
          fontWeight: "500",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ─── LiveRecorder ─────────────────────────────────────────────────────────────
const LiveRecorder = () => {
  const {
    waveform,
    isMuted,
    toggleMute,
    elapsed,
    currentSession,
    isStreaming,
    stopCreatorStream,
  } = useLiveNotification();
  const { user } = useAuth();
  const { ref: liveRecorderSheet } = useLiveRecorderSheet();
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);

  const [token, setToken] = useState("");

  useEffect(() => {
    getAuth().then((data) => setToken(data?.accessToken ?? ""));
  }, []);

  const streamId = (currentSession as any)?.streamId ?? "";

  const { streamState, recentComments, connect, disconnect } = useStreamChannel({
    streamId: streamId || "__placeholder__",
    token,
    onSegmentReady: () => {},
    onStreamEnded: () => {},
    autoConnect: false,
  });

  useEffect(() => {
    if (isStreaming && streamId && token) {
      connect();
    } else {
      disconnect();
    }
  }, [isStreaming, streamId, token]);

  const viewerCount = streamState?.viewer_count ?? 0;
  const formatCount = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
        ? `${(n / 1_000).toFixed(1)}k`
        : String(n);

  const handleClose = () => liveRecorderSheet.current?.close();

  const handleEnd = async () => {
    await stopCreatorStream();
    liveRecorderSheet.current?.close();
  };

  const handleShare = () => {
    shareLive(String(user?.id ?? ""), currentSession?.title ?? "my stream");
  };

  return (
    <Sheet
      showCloseButton={false}
      context={LiveRecorderSheetContext}
      snapPoints={[0.1, 500, 10000]}
    >
      <View style={{ flex: 1 }}>
        {/* Header */}
        <PageHead
          title="Streaming live..."
          has_profile={true}
          customIcons={[
            {
              icon: icons.close_modal,
              onPress: handleClose,
              testID: "close-btn",
            },
          ]}
        />

        {/* Listeners pill */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: "rgba(255,255,255,0.07)",
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              alignSelf: "flex-start",
            }}
          >
            <Image source={icons.listening} style={{ width: 18, height: 18 }} />
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
              {formatCount(viewerCount)} listeners
            </Text>
          </View>
        </View>

        {/* Comments with fade */}
        <View style={{ height: 280, position: "relative" }}>
          <LinearGradient
            colors={["rgba(17,24,39,1)", "rgba(17,24,39,0.5)", "rgba(0,0,0,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="w-full h-full absolute z-10 inset-0 pointer-events-none"
          />
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
          >
            {recentComments.length === 0 ? (
              <Text
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 13,
                  textAlign: "center",
                  marginTop: 80,
                }}
              >
                No comments yet
              </Text>
            ) : (
              recentComments.map((c) => (
                <Comment
                  key={c.id}
                  username={c.creator_name ?? "Listener"}
                  content={c.text}
                  timestamp={new Date(c.inserted_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              ))
            )}
          </ScrollView>
        </View>

        {/* Waveform */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <WaveformRecorder
            points={waveform}
            elapsed={elapsed}
            title={currentSession?.title ?? "Live"}
            width={width - 32}
            height={90}
            barColor="#ffffff"
            playheadColor="#e53935"
          />
        </View>
        <View className="flex-1" />

        {/* Controls */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 8,
            marginBottom: 17,
          }}
        >
          <CtrlBtn
            icon={
              <Ionicons
                name={isMuted ? "mic-off" : "mic-outline"}
                size={20}
                color={isMuted ? "#ef5350" : "#fff"}
              />
            }
            label={isMuted ? "Unmute" : "Mute"}
            onPress={toggleMute}
            active={isMuted}
          />

          <CtrlBtn
            icon={<Ionicons name="pause" size={20} color="#fff" />}
            label="Pause"
            onPress={() => {}}
          />

          <CtrlBtn
            icon={<Ionicons name="stop" size={24} color="#fff" />}
            label="End"
            onPress={handleEnd}
            danger
            primary
          />

          <CtrlBtn
            icon={
              <Ionicons name="share-social-outline" size={20} color="#fff" />
            }
            label="Share"
            onPress={handleShare}
          />

          <CtrlBtn
            icon={<Ionicons name="ellipsis-vertical" size={20} color="#fff" />}
            label="More"
            onPress={() => {}}
          />
        </View>
      </View>
    </Sheet>
  );
};

export default LiveRecorder;
