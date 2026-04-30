import { icons } from "@/constants/icons";
import {
  LiveRecorderSheetContext,
  Sheet,
  useLiveRecorderSheet,
} from "@/context/CreateSheetContext";
import { useLiveNotification } from "@/context/LiveNotificationContext";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { WaveformRecorder } from "../WaveformLine";
import {
  Pressable,
  ScrollView,
  Share,
  Text,
  useWindowDimensions,
  View,
  Image,
} from "react-native";
import Comment from "../Comment";
import PageHead from "../PageHead";
import { images } from "@/constants/image";

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

type StreamerProps = {
  username: string;
  avatarUrl: any;
  isHost?: boolean;
};

const Streamers = ({ username, avatarUrl, isHost }: StreamerProps) => {
  return (
    <View className="w-32 h-44 border border-[#7e7e7e19] items-center justify-center bg-[#7e7e7e28] rounded gap-4">
      <Image
        source={avatarUrl}
        className="w-20 h-20 rounded-full border border-[#7e7e7e19]"
      />
      <Text className="text-textSecondary font-MonBold text-xs">
        {username}
      </Text>
    </View>
  );
};

// ─── LiveRecorder ─────────────────────────────────────────────────────────────
const LiveRecorder = () => {
  const {
    waveform,
    isMuted,
    toggleMute,
    elapsed,
    currentSession,
    stopCreatorStream,
  } = useLiveNotification();
  const { ref: liveRecorderSheet } = useLiveRecorderSheet();
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);

  const handleClose = () => liveRecorderSheet.current?.close();

  const handleEnd = async () => {
    await stopCreatorStream();
    liveRecorderSheet.current?.close();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Tune in to "${currentSession?.title}" — live now!`,
      });
    } catch (e) {
      console.error("Share error:", e);
    }
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
              200k listeners
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
            <Comment
              username="Alice"
              content="Loving the vibes!"
              timestamp="2m ago"
            />
            <Comment
              username="Alice"
              content="Loving the vibes!"
              timestamp="2m ago"
            />
            <Comment
              username="Bob"
              content="When's the next episode dropping?"
              timestamp="5m ago"
            />
            <Comment
              username="Charlie"
              content="This is fire! 🔥"
              timestamp="10m ago"
            />
            <Comment
              username="Diana"
              content="Can you talk about your recording setup?"
              timestamp="15m ago"
            />
            <Comment
              username="Diana"
              content="Can you talk about your recording setup?"
              timestamp="15m ago"
            />
            <Comment
              username="Diana"
              content="Can you talk about your recording setup?"
              timestamp="15m ago"
            />
          </ScrollView>
        </View>
        {/* <View>
          <Streamers
            username="HostAlice"
            avatarUrl={images.profile3}
            isHost={true}
          />
        </View> */}
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
        <View className="flex-1">

        </View>

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
          {/* Mute */}
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

          {/* Pause — wired to context when you add pause support */}
          <CtrlBtn
            icon={<Ionicons name="pause" size={20} color="#fff" />}
            label="Pause"
            onPress={() => {}}
          />

          {/* End — primary destructive */}
          <CtrlBtn
            icon={<Ionicons name="stop" size={24} color="#fff" />}
            label="End"
            onPress={handleEnd}
            danger
            primary
          />

          {/* Share */}
          <CtrlBtn
            icon={
              <Ionicons name="share-social-outline" size={20} color="#fff" />
            }
            label="Share"
            onPress={handleShare}
          />

          {/* More */}
          <CtrlBtn
            icon={<Ionicons name="ellipsis-vertical" size={20} color="#fff" />}
            label="More"
            onPress={() => {
              // open options sheet — invite, viewer list, stream settings
            }}
          />
        </View>
      </View>
    </Sheet>
  );
};

export default LiveRecorder;
