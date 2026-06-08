import { View, Text, Image, Pressable, ScrollView } from "react-native";
import React from "react";
import { images } from "@/constants/image";
import { LinearGradient } from "expo-linear-gradient";

// ─── Types ────────────────────────────────────────────────────────────────────
// Replace with real session data from WebSocket when the backend is ready
export interface ListeningSession {
  id: string;
  title: string;
  thumbnail: any;
  listeners: { id: string; name: string; avatar: any }[];
  currentTime: number;  // seconds into the audio
  duration: number;     // total seconds
}

// ─── Hardcoded sessions — swap for real WS data later ────────────────────────
const MOCK_SESSIONS: ListeningSession[] = [
  {
    id: "1",
    title: "The Huberman Lab: Sleep Science & Recovery",
    thumbnail: images.pod1,
    listeners: [
      { id: "a", name: "Sarah", avatar: images.profile1 },
      { id: "b", name: "Mike", avatar: images.profile2 },
      { id: "c", name: "Ada", avatar: images.profile3 },
    ],
    currentTime: 2540,
    duration: 5400,
  },
  {
    id: "2",
    title: "How I Built This: The Airbnb Founders",
    thumbnail: images.pod2,
    listeners: [
      { id: "d", name: "James", avatar: images.profile4 },
      { id: "e", name: "Lola", avatar: images.profile5 },
    ],
    currentTime: 1200,
    duration: 3600,
  },
  {
    id: "3",
    title: "Diary of a CEO: The Psychology of Habits",
    thumbnail: images.pod3,
    listeners: [
      { id: "f", name: "Tolu", avatar: images.profile1 },
    ],
    currentTime: 600,
    duration: 2700,
  },
  {
    id: "4",
    title: "TED Talks Daily: The Future of AI",
    thumbnail: images.pod4,
    listeners: [
      { id: "g", name: "Ayo", avatar: images.profile2 },
      { id: "h", name: "Kemi", avatar: images.profile3 },
      { id: "i", name: "Bayo", avatar: images.profile4 },
      { id: "j", name: "Zara", avatar: images.profile5 },
    ],
    currentTime: 420,
    duration: 1800,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function listenerLabel(listeners: ListeningSession["listeners"]): string {
  if (listeners.length === 1) return listeners[0].name;
  if (listeners.length === 2) return `${listeners[0].name} & ${listeners[1].name}`;
  return `${listeners[0].name}, ${listeners[1].name} & ${listeners.length - 2} more`;
}

// ─── Session card ─────────────────────────────────────────────────────────────
function SessionCard({ session }: { session: ListeningSession }) {
  const progress = session.duration > 0 ? session.currentTime / session.duration : 0;
  const AVATAR_SIZE = 28;
  const MAX_AVATARS = 3;
  const shown = session.listeners.slice(0, MAX_AVATARS);
  const overflow = session.listeners.length - MAX_AVATARS;

  return (
    <View
      className="w-64 rounded-3xl overflow-hidden"
      style={{ backgroundColor: "#1c1e27" }}
    >
      {/* Thumbnail with gradient overlay */}
      <View className="w-full h-36 relative">
        <Image source={session.thumbnail} className="w-full h-full" resizeMode="cover" />
        <LinearGradient
          colors={["transparent", "rgba(28,30,39,0.95)"]}
          start={{ x: 0, y: 0.3 }}
          end={{ x: 0, y: 1 }}
          className="absolute inset-0 w-full h-full"
        />
        {/* Listener avatars overlapping */}
        <View className="absolute bottom-3 left-3 flex-row items-center">
          {shown.map((l, i) => (
            <Image
              key={l.id}
              source={l.avatar}
              className="rounded-full border-2 border-[#1c1e27]"
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                marginLeft: i === 0 ? 0 : -8,
              }}
            />
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
      </View>

      {/* Info */}
      <View className="px-3 pt-2 pb-3 gap-1">
        <Text className="text-textSecondary font-MonRegular text-[11px]">
           {listenerLabel(session.listeners)} listening
        </Text>
        <Text className="text-textPrimary font-MonBold text-sm" numberOfLines={2}>
          {session.title}
        </Text>

        {/* Progress bar */}
        <View className="mt-1.5">
          <View className="w-full h-[3px] rounded-full bg-white/10">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
          <Text className="text-textSecondary font-MonRegular text-[10px] mt-1">
            {formatTime(session.currentTime)} in · {formatTime(session.duration)} total
          </Text>
        </View>

        {/* Join button */}
        <Pressable className="mt-2 rounded-xl bg-primary/15 border border-primary/30 py-2 items-center">
          <Text className="text-primary font-MonBold text-xs">Join session</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ListeningNow() {
  return (
    <View className="mt-4">
      {/* <View className="flex-row items-baseline gap-2 mb-4">
        <Text className="text-textPrimary font-MonBold text-xl">Listening now</Text>
        <View className="w-2 h-2 rounded-full bg-primary" />
      </View> */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {MOCK_SESSIONS.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </ScrollView>
    </View>
  );
}
