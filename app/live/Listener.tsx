import { useHLSPlayer } from "@/hook/Usehlsplayer";
import { useStreamChannel } from "@/hook/Usestreamchannel";
import { getAuth } from "@/storage/authStorage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PageHead from "@/components/PageHead";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLORS = {
  bg: "#1a1a2e",
  card: "#16213e",
  surface: "#0f3460",
  accent: "#e94560",
  text: "#ffffff",
  muted: "#8892a4",
  border: "#1e2d4a",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RouteParams {
  streamId: string;
  title: string;
  creatorName: string;
  creatorAvatar?: string;
  masterUrl: string; // Full URL to master.m3u8
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ListenerPlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as unknown as RouteParams;
  const [token, setToken] = useState("");

  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const [commentText, setCommentText] = useState("");
  useEffect(() => {
    (async () => {
      const stored = await getAuth();
      const token = stored?.accessToken ?? "";
      setToken(token);
    })();
  }, []);
  // HLS player — handles playlist polling and segment playback
  const {
    isPlaying,
    isBuffering,
    isEnded,
    currentSegment,
    error,
    pause,
    resume,
    onSegmentReady,
    onStreamEnded,
  } = useHLSPlayer({
    masterUrl: params.masterUrl,
    quality,
    autoPlay: true,
  });

  // Phoenix Channel — handles real-time events
  const { isConnected, streamState, recentComments, sendComment } =
    useStreamChannel({
      streamId: params.streamId,
      token: token!,
      onSegmentReady: (payload) => onSegmentReady(payload.urls),
      onStreamEnded,
    });

  const handleSendComment = useCallback(() => {
    const text = commentText.trim();
    if (!text) return;
    sendComment(text);
    setCommentText("");
  }, [commentText, sendComment]);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderComment = ({ item }: { item: any }) => (
    <View style={styles.comment}>
      {item.creator_avatar ? (
        <Image
          source={{ uri: item.creator_avatar }}
          style={styles.commentAvatar}
        />
      ) : (
        <View style={styles.commentAvatarPlaceholder}>
          <Text style={styles.commentAvatarInitial}>
            {(item.creator_name ?? "?")[0].toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.commentBody}>
        <Text style={styles.commentName}>
          {item.creator_name ?? "Listener"}
        </Text>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
    </View>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {params.title}
            </Text>
            <Text style={styles.headerMeta}>
              {params.creatorName}
              {streamState?.viewer_count != null
                ? `  ·  ${streamState.viewer_count} listening`
                : ""}
            </Text>
          </View>

          {/* Connection indicator */}
          <View
            style={[
              styles.dot,
              { backgroundColor: isConnected ? "#4caf50" : COLORS.muted },
            ]}
          />
        </View>

        {/* Player card */}
        <View style={styles.playerCard}>
          {/* Creator avatar / thumbnail */}
          <View style={styles.avatarWrap}>
            {params.creatorAvatar ? (
              <Image
                source={{ uri: params.creatorAvatar }}
                style={styles.creatorAvatar}
              />
            ) : (
              <View style={styles.creatorAvatarPlaceholder}>
                <Text style={styles.creatorAvatarInitial}>
                  {(params.creatorName ?? "?")[0].toUpperCase()}
                </Text>
              </View>
            )}
            {isBuffering && (
              <View style={styles.bufferingOverlay}>
                <ActivityIndicator color={COLORS.accent} size="large" />
              </View>
            )}
          </View>

          {/* Stream ended banner */}
          {isEnded && (
            <View style={styles.endedBanner}>
              <Text style={styles.endedText}>Stream ended</Text>
            </View>
          )}

          {/* Error */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Segment counter — useful for debugging, can remove in prod */}
          {currentSegment > 0 && (
            <Text style={styles.segmentCounter}>Segment {currentSegment}</Text>
          )}

          {/* Play / Pause */}
          <TouchableOpacity
            style={styles.playBtn}
            onPress={isPlaying ? pause : resume}
            disabled={isBuffering || isEnded}
          >
            <Text style={styles.playBtnIcon}>{isPlaying ? "⏸" : "▶"}</Text>
          </TouchableOpacity>

          {/* Quality selector */}
          <View style={styles.qualityRow}>
            {(["low", "medium", "high"] as const).map((q) => (
              <TouchableOpacity
                key={q}
                style={[
                  styles.qualityBtn,
                  quality === q && styles.qualityBtnActive,
                ]}
                onPress={() => setQuality(q)}
              >
                <Text
                  style={[
                    styles.qualityLabel,
                    quality === q && styles.qualityLabelActive,
                  ]}
                >
                  {q === "low" ? "128k" : q === "medium" ? "192k" : "320k"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Comments */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeading}>Comments</Text>

          <FlatList
            data={recentComments}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            style={styles.commentsList}
            contentContainerStyle={styles.commentsContent}
            inverted={false}
          />

          {/* Comment input */}
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Say something..."
              placeholderTextColor={COLORS.muted}
              value={commentText}
              onChangeText={setCommentText}
              onSubmitEditing={handleSendComment}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handleSendComment}
              disabled={!commentText.trim()}
            >
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, marginRight: 12 },
  backIcon: { color: COLORS.text, fontSize: 20 },
  headerInfo: { flex: 1 },
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: "600" },
  headerMeta: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },

  // Player card
  playerCard: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  avatarWrap: { position: "relative", marginBottom: 16 },
  creatorAvatar: { width: 100, height: 100, borderRadius: 50 },
  creatorAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  creatorAvatarInitial: { color: COLORS.text, fontSize: 36, fontWeight: "700" },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  endedBanner: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  endedText: { color: COLORS.muted, fontSize: 13 },
  errorText: { color: COLORS.accent, fontSize: 12, marginBottom: 8 },
  segmentCounter: { color: COLORS.muted, fontSize: 11, marginBottom: 8 },

  // Play button
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  playBtnIcon: { color: COLORS.text, fontSize: 24 },

  // Quality
  qualityRow: { flexDirection: "row", gap: 8 },
  qualityBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qualityBtnActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  qualityLabel: { color: COLORS.muted, fontSize: 12 },
  qualityLabelActive: { color: COLORS.text, fontWeight: "600" },

  // Comments
  commentsSection: { flex: 1, marginTop: 16, paddingHorizontal: 16 },
  commentsHeading: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  commentsList: { flex: 1 },
  commentsContent: { paddingBottom: 8 },

  comment: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  commentAvatar: { width: 32, height: 32, borderRadius: 16 },
  commentAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarInitial: { color: COLORS.text, fontSize: 13, fontWeight: "600" },
  commentBody: { flex: 1 },
  commentName: { color: COLORS.muted, fontSize: 11, marginBottom: 2 },
  commentText: { color: COLORS.text, fontSize: 13 },

  // Comment input
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  commentInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    color: COLORS.text,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendBtnText: { color: COLORS.text, fontSize: 13, fontWeight: "600" },
});
