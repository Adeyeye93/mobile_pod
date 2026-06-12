import Comment from "@/components/Comment";
import { images } from "@/constants/image";
import { icons } from "@/constants/icons";
import { useHLSPlayer } from "@/hook/Usehlsplayer";
import { useStreamChannel } from "@/hook/Usestreamchannel";
import { getAuth } from "@/storage/authStorage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Constants ────────────────────────────────────────────────────────────────
const { width: SCREEN_W } = Dimensions.get("window");
const ARTWORK_H = Math.round(SCREEN_W * 0.72); // ~72vw — squarish artwork
const BG = "#181a20";
const QUALITY_LABELS = { low: "128k", medium: "192k", high: "320k" } as const;

// ─── Route params ─────────────────────────────────────────────────────────────
interface RouteParams {
  streamId: string;
  title: string;
  creatorName: string;
  creatorAvatar?: string;
  thumbnailUrl?: string;
  masterUrl: string;
}

// ─── Pulsing dots — simple live audio indicator ───────────────────────────────
function LiveDots({ active }: { active: boolean }) {
  return (
    <View className="flex-row items-end gap-[3px] h-4">
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={{ width: 3, height: active ? 4 + i * 3 : 4, borderRadius: 2 }}
          className="bg-primary"
        />
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ListenerPlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as unknown as RouteParams;

  const [token, setToken] = useState("");
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const [commentText, setCommentText] = useState("");
  const commentsRef = useRef<ScrollView>(null);

  // Load token once — channel connects manually when ready
  useEffect(() => {
    getAuth().then((s) => setToken(s?.accessToken ?? ""));
  }, []);

  // ── HLS player ─────────────────────────────────────────────────────────────
  const {
    isPlaying,
    isBuffering,
    isEnded,
    error,
    pause,
    resume,
    onSegmentReady,
    onStreamEnded,
  } = useHLSPlayer({ masterUrl: params.masterUrl, quality, autoPlay: true });

  // ── Phoenix channel ─────────────────────────────────────────────────────────
  const { isConnected, streamState, recentComments, sendComment, connect } =
    useStreamChannel({
      streamId: params.streamId,
      token,
      onSegmentReady: (p) => onSegmentReady(p.urls),
      onStreamEnded,
      autoConnect: false,
    });

  // Connect as soon as the auth token is available
  useEffect(() => {
    if (token) connect();
  }, [token, connect]);

  // Scroll comments to the bottom on new messages
  useEffect(() => {
    if (recentComments.length > 0)
      commentsRef.current?.scrollToEnd({ animated: true });
  }, [recentComments.length]);

  const handleSend = useCallback(() => {
    const text = commentText.trim();
    if (!text) return;
    sendComment(text);
    setCommentText("");
  }, [commentText, sendComment]);

  const formatViewers = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
        ? `${(n / 1_000).toFixed(1)}k`
        : String(n);

  const thumbnailSource = params.thumbnailUrl
    ? { uri: params.thumbnailUrl }
    : images.podDefault;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >

        {/* ══ ARTWORK HERO ════════════════════════════════════════════════ */}
        <View style={{ height: ARTWORK_H }}>
          <ImageBackground
            source={thumbnailSource}
            style={{ flex: 1 }}
            resizeMode="cover"
          >
            {/* Dim overlay so controls are readable */}
            <View className="absolute inset-0 bg-black/30" />

            {/* Top bar — back + live badge + viewers */}
            <View className="flex-row items-center justify-between px-4 pt-2">
              <Pressable
                onPress={() => router.back()}
                className="w-9 h-9 rounded-full bg-black/40 items-center justify-center"
              >
                <Ionicons name="chevron-down" size={20} color="#fff" />
              </Pressable>

              <View className="flex-row items-center gap-2">
                {/* LIVE badge */}
                {!isEnded && (
                  <View className="flex-row items-center gap-1 bg-primary rounded-md px-2 py-0.5">
                    <View className="w-1.5 h-1.5 rounded-full bg-white" />
                    <Text className="text-white font-MonBold text-[10px] tracking-widest">
                      LIVE
                    </Text>
                  </View>
                )}

                {/* Viewer count */}
                {streamState?.viewer_count != null && (
                  <View className="flex-row items-center gap-1 bg-black/40 rounded-full px-3 py-1">
                    <Ionicons name="headset-outline" size={12} color="#fff" />
                    <Text className="text-white font-MonMedium text-xs">
                      {formatViewers(streamState.viewer_count)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Bottom gradient — fades artwork into background */}
            <LinearGradient
              colors={["transparent", `${BG}ee`, BG]}
              locations={[0.3, 0.75, 1]}
              className="absolute bottom-0 left-0 right-0 h-40"
            />
          </ImageBackground>
        </View>

        {/* ══ STREAM INFO + CONTROLS ══════════════════════════════════════ */}
        <View className="px-5 -mt-16 pb-2">
          {/* Creator avatar + name */}
          <View className="flex-row items-center gap-3 mb-3">
            {params.creatorAvatar ? (
              <Image
                source={{ uri: params.creatorAvatar }}
                className="w-9 h-9 rounded-full"
              />
            ) : (
              <View className="w-9 h-9 rounded-full bg-primary/30 items-center justify-center">
                <Text className="text-primary font-MonBold text-sm">
                  {(params.creatorName ?? "?")[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <Text
                className="text-textPrimary font-MonBold text-lg leading-tight"
                numberOfLines={2}
              >
                {params.title}
              </Text>
              <Text className="text-textSecondary font-MonMedium text-sm">
                {params.creatorName}
              </Text>
            </View>
          </View>

          {/* Connection status + waveform dots */}
          <View className="flex-row items-center gap-3 mb-4">
            <LiveDots active={isPlaying} />
            <Text className="text-textSecondary font-MonRegular text-xs">
              {isEnded
                ? "Stream ended"
                : isBuffering
                  ? "Buffering…"
                  : isConnected
                    ? "Live now"
                    : "Connecting…"}
            </Text>
          </View>

          {/* Error */}
          {error && (
            <Text className="text-red-400 font-MonRegular text-xs mb-3">
              {error}
            </Text>
          )}

          {/* Controls row — quality pills + play button */}
          <View className="flex-row items-center justify-between">
            {/* Quality pills */}
            <View className="flex-row gap-2">
              {(["low", "medium", "high"] as const).map((q) => (
                <Pressable
                  key={q}
                  onPress={() => setQuality(q)}
                  className={`px-3 py-1 rounded-full border ${
                    quality === q
                      ? "bg-primary border-primary"
                      : "border-white/15 bg-white/5"
                  }`}
                >
                  <Text
                    className={`font-MonMedium text-[11px] ${
                      quality === q ? "text-white" : "text-textSecondary"
                    }`}
                  >
                    {QUALITY_LABELS[q]}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Play / Pause */}
            <Pressable
              onPress={isPlaying ? pause : resume}
              disabled={isBuffering || isEnded}
              className={`w-14 h-14 rounded-full items-center justify-center ${
                isBuffering || isEnded ? "bg-white/10" : "bg-primary"
              }`}
              style={{
                shadowColor: "#4169e1",
                shadowOpacity: isPlaying ? 0.6 : 0,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 4 },
                elevation: isPlaying ? 8 : 0,
              }}
            >
              {isBuffering && !isEnded ? (
                <Ionicons name="radio-outline" size={22} color="#fff" />
              ) : (
                <Image
                  source={isPlaying ? icons.pause : icons.play}
                  className="w-6 h-6"
                  tintColor="#ffffff"
                />
              )}
            </Pressable>
          </View>
        </View>

        {/* ══ COMMENTS ════════════════════════════════════════════════════ */}
        <View
          className="flex-1 border-t border-white/8 mx-4 mt-2"
        >
          <Text className="text-textPrimary font-MonBold text-sm pt-3 pb-2">
            Live comments
          </Text>

          <ScrollView
            ref={commentsRef}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              commentsRef.current?.scrollToEnd({ animated: true })
            }
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {recentComments.length === 0 ? (
              <View className="items-center py-8 gap-2">
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={28}
                  color="rgba(255,255,255,0.2)"
                />
                <Text className="text-white/25 font-MonRegular text-sm">
                  No comments yet. Be first!
                </Text>
              </View>
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

        {/* ══ COMMENT INPUT ════════════════════════════════════════════════ */}
        <View className="flex-row items-center gap-3 px-4 pt-2 pb-3 border-t border-white/8">
          <TextInput
            style={{
              flex: 1,
              backgroundColor: "rgba(255,255,255,0.07)",
              color: "#E4E7EC",
              borderRadius: 22,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 14,
              fontFamily: "regular",
            }}
            placeholder="Say something…"
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={commentText}
            onChangeText={setCommentText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            submitBehavior="submit"
          />
          <Pressable
            onPress={handleSend}
            disabled={!commentText.trim()}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              commentText.trim() ? "bg-primary" : "bg-white/8"
            }`}
          >
            <Ionicons
              name="send"
              size={15}
              color={commentText.trim() ? "#fff" : "rgba(255,255,255,0.25)"}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
