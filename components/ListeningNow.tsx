import { View, Text, Image, Pressable, ScrollView } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { images } from "@/constants/image";
import { useAudio } from "@/context/AudioPlayerContext";
import { usePlayer } from "@/context/PlayerContext";
import type { ListeningSession, MatchReason, SessionListener } from "@/hook/useListeningSessions";

const AVATAR_SIZE = 28;
const MAX_AVATARS = 3;

function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function listenerLabel(count: number, listeners: SessionListener[]): string {
  if (count === 1 && listeners[0]) return `${listeners[0].username} listening`;
  if (count === 2 && listeners[0] && listeners[1])
    return `${listeners[0].username} & ${listeners[1].username} listening`;
  if (listeners[0])
    return `${listeners[0].username} & ${count - 1} others listening`;
  return `${count} listening`;
}

function MatchBadge({ match }: { match: MatchReason }) {
  if (match === "none") return null;

  const config = {
    both:     { label: "Follows you · Shared interest", bg: "bg-primary/15",  text: "text-primary" },
    interest: { label: "Based on your interests",        bg: "bg-violet-500/15", text: "text-violet-400" },
    location: { label: "Near you",                       bg: "bg-emerald-500/15", text: "text-emerald-400" },
  } as const;

  const { label, bg, text } = config[match];
  return (
    <View className={`${bg} rounded-full px-2 py-0.5 self-start mb-1`}>
      <Text className={`${text} font-MonMedium text-[10px]`}>{label}</Text>
    </View>
  );
}

function ListenerAvatars({ listeners, total }: { listeners: SessionListener[]; total: number }) {
  const shown = listeners.slice(0, MAX_AVATARS);
  const overflow = total - MAX_AVATARS;

  return (
    <View className="flex-row items-center">
      {shown.map((l, i) => (
        <View
          key={l.user_id}
          className="rounded-full border-2 border-[#1c1e27] overflow-hidden"
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            marginLeft: i === 0 ? 0 : -8,
          }}
        >
          {l.avatar_url ? (
            <Image
              source={{ uri: l.avatar_url }}
              style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
            />
          ) : (
            <View
              style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
              className="bg-primary/20 items-center justify-center"
            >
              <Text className="text-primary font-MonBold" style={{ fontSize: 10 }}>
                {(l.username ?? "?")[0].toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      ))}
      {overflow > 0 && (
        <View
          className="rounded-full border-2 border-[#1c1e27] bg-primary items-center justify-center"
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, marginLeft: -8 }}
        >
          <Text className="text-white font-MonBold" style={{ fontSize: 9 }}>
            +{overflow}
          </Text>
        </View>
      )}
    </View>
  );
}

function SessionCard({ session }: { session: ListeningSession }) {
  const { loadTrack, player } = useAudio();
  const { ref: playerRef } = usePlayer();
  const progress = session.duration_seconds > 0
    ? session.current_position_seconds / session.duration_seconds
    : 0;

  const join = async () => {
    await loadTrack({
      id: session.recording_id,
      title: session.title,
      creatorName: session.creator_name,
      creatorId: session.creator_id,
      thumbnail: session.thumbnail_url,
      creatorAvatar: null,
      masterUrl: session.master_url,
      durationSeconds: session.duration_seconds,
    });
    // Seek to where the group is
    if (session.current_position_seconds > 0) {
      player.seekTo(session.current_position_seconds);
    }
    playerRef.current?.expand();
  };

  return (
    <View className="w-64 rounded-3xl overflow-hidden" style={{ backgroundColor: "#1c1e27" }}>
      {/* Thumbnail */}
      <View className="w-full h-36 relative">
        <Image
          source={session.thumbnail_url ? { uri: session.thumbnail_url } : images.podDefault}
          className="w-full h-full"
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(28,30,39,0.95)"]}
          start={{ x: 0, y: 0.3 }}
          end={{ x: 0, y: 1 }}
          className="absolute inset-0 w-full h-full"
        />
        <View className="absolute bottom-3 left-3">
          <ListenerAvatars listeners={session.listeners} total={session.listener_count} />
        </View>
      </View>

      {/* Info */}
      <View className="px-3 pt-2 pb-3 gap-1">
        <Text className="text-textSecondary font-MonRegular text-[11px]">
          {listenerLabel(session.listener_count, session.listeners)}
        </Text>
        <Text className="text-textPrimary font-MonBold text-sm" numberOfLines={2}>
          {session.title}
        </Text>

        <MatchBadge match={session.match} />

        {/* Progress bar */}
        <View className="mt-0.5">
          <View className="w-full h-[3px] rounded-full bg-white/10">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
          <Text className="text-textSecondary font-MonRegular text-[10px] mt-1">
            {formatTime(session.current_position_seconds)} in · {formatTime(session.duration_seconds)} total
          </Text>
        </View>

        <Pressable onPress={join} className="mt-2 rounded-xl bg-primary/15 border border-primary/30 py-2 items-center">
          <Text className="text-primary font-MonBold text-xs">Join session</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Skeleton card while loading
function SessionSkeleton() {
  return (
    <View className="w-64 rounded-3xl overflow-hidden" style={{ backgroundColor: "#1c1e27" }}>
      <View className="w-full h-36 bg-white/5" />
      <View className="px-3 pt-2 pb-3 gap-2">
        <View className="h-3 w-24 rounded-full bg-white/5" />
        <View className="h-4 w-48 rounded-full bg-white/5" />
        <View className="h-[3px] w-full rounded-full bg-white/5 mt-1" />
        <View className="h-8 w-full rounded-xl bg-white/5 mt-2" />
      </View>
    </View>
  );
}

interface ListeningNowProps {
  sessions: ListeningSession[];
  loading: boolean;
}

export default function ListeningNow({ sessions, loading }: ListeningNowProps) {
  if (!loading && sessions.length === 0) return null;

  return (
    <View className="mt-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {loading
          ? [0, 1, 2].map((i) => <SessionSkeleton key={i} />)
          : sessions.map((session) => (
              <SessionCard key={session.recording_id} session={session} />
            ))}
      </ScrollView>
    </View>
  );
}
