import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "@/libs/api";
import { images } from "@/constants/image";
import { icons } from "@/constants/icons";
import { useCreatorEpisodes } from "@/hook/useCreatorEpisodes";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreatorProfile {
  id: string;
  channel_name: string;
  avatar_url: string | null;
  follower_count: number;
  recording_count: number;
}

interface Stream {
  id: string;
  title: string;
  status: "scheduled" | "live" | "ended";
  scheduled_start_time: string | null;
  thumbnail: string | null;
  creator_id?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

function formatStreamDate(iso: string | null): string {
  if (!iso) return "Unscheduled";
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const isTomorrow =
    d.toDateString() === new Date(now.getTime() + 86400000).toDateString();

  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Today · ${time}`;
  if (isTomorrow) return `Tomorrow · ${time}`;
  return (
    d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) +
    ` · ${time}`
  );
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return `${h}h ${rem}m`;
  }
  return `${m}m ${s}s`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  comingSoon,
}: {
  label: string;
  value?: string;
  comingSoon?: boolean;
}) {
  return (
    <View className="flex-1 bg-[#16213e] rounded-2xl p-4 gap-1">
      <Text className="text-[#6b7fa3] font-MonMedium text-xs uppercase tracking-wider">
        {label}
      </Text>
      {comingSoon ? (
        <View className="flex-row items-center gap-2 mt-1">
          <View className="bg-[#0f3460] px-2 py-0.5 rounded-full">
            <Text className="text-[#4a90e2] font-MonMedium text-[10px]">
              Soon
            </Text>
          </View>
        </View>
      ) : (
        <Text className="text-textPrimary font-MonBold text-2xl">{value}</Text>
      )}
    </View>
  );
}

function UpcomingStreamCard({ stream }: { stream: Stream }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push("/(tabs)/creator-live")}
      className="flex-row items-center gap-3 bg-[#16213e] rounded-2xl p-3 mb-3"
    >
      <Image
        source={stream.thumbnail ? { uri: stream.thumbnail } : images.podDefault}
        className="w-14 h-14 rounded-xl"
      />
      <View className="flex-1">
        <Text
          className="text-textPrimary font-MonBold text-sm"
          numberOfLines={1}
        >
          {stream.title}
        </Text>
        <Text className="text-[#6b7fa3] font-MonRegular text-xs mt-0.5">
          {formatStreamDate(stream.scheduled_start_time)}
        </Text>
      </View>
      {stream.status === "live" && (
        <View className="bg-primary px-2.5 py-1 rounded-full">
          <Text className="text-white font-MonBold text-[10px]">LIVE</Text>
        </View>
      )}
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CreatorDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [profileRes, streamsRes] = await Promise.all([
        api.get("creator/profile"),
        api.get("streams/my"),
      ]);
      const p = profileRes.data?.creator ?? profileRes.data;
      const list: Stream[] = streamsRes.data?.streams ?? [];
      // Fallback: grab creator_id from first stream until backend includes id in profile
      const idFromStream = list[0]?.creator_id ?? "";
      setProfile({
        id: p.id ?? idFromStream,
        channel_name: p.channel_name ?? p.name ?? "My Channel",
        avatar_url: p.avatar_url ?? p.avatar ?? null,
        follower_count: p.follower_count ?? 0,
        recording_count: p.recording_count ?? 0,
      });
      setStreams(list);
    } catch {
      // silently degrade
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { episodes, loading: episodesLoading } = useCreatorEpisodes(
    profile?.id ?? ""
  );

  const upcomingStreams = streams
    .filter((s) => s.status === "scheduled" || s.status === "live")
    .sort((a, b) => {
      if (!a.scheduled_start_time) return 1;
      if (!b.scheduled_start_time) return -1;
      return (
        new Date(a.scheduled_start_time).getTime() -
        new Date(b.scheduled_start_time).getTime()
      );
    })
    .slice(0, 3);

  const recentEpisodes = episodes.slice(0, 3);

  return (
    <ScrollView
      className="flex-1 bg-CreatorBG"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* ─── Gradient background ─── */}
      <View className="absolute top-0 left-0 right-0 h-72 z-0">
        <LinearGradient
          colors={["rgba(255,255,255,0.15)", "rgba(26,26,46,1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="flex-1"
        />
      </View>

      {/* ─── Header ─── */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-5">
        <View className="flex-1">
          <Text className="text-[#6b7fa3] font-MonRegular text-sm">
            Welcome back
          </Text>
          {loading ? (
            <View className="h-8 w-40 bg-white/10 rounded-lg mt-1" />
          ) : (
            <Text
              className="text-textPrimary font-MonBold text-2xl"
              numberOfLines={1}
            >
              {profile?.channel_name ?? "My Channel"}
            </Text>
          )}
        </View>
        <View className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10">
          {loading ? (
            <View className="flex-1 bg-white/10" />
          ) : (
            <Image
              source={
                profile?.avatar_url
                  ? { uri: profile.avatar_url }
                  : images.chaDefault
              }
              className="w-full h-full"
              resizeMode="cover"
            />
          )}
        </View>
      </View>

      {/* ─── Stats grid ─── */}
      <View className="px-5 gap-3">
        <Text className="text-[#6b7fa3] font-MonMedium text-xs uppercase tracking-widest">
          Channel Overview
        </Text>
        <View className="flex-row gap-3">
          <StatCard
            label="Followers"
            value={loading ? "—" : formatK(profile?.follower_count ?? 0)}
          />
          <StatCard
            label="Episodes"
            value={loading ? "—" : `${profile?.recording_count ?? 0}`}
          />
        </View>
        <View className="flex-row gap-3">
          <StatCard label="Total Plays" comingSoon />
          <StatCard label="Avg Listen Time" comingSoon />
        </View>
      </View>

      {/* ─── Quick actions ─── */}
      <View className="px-5 mt-7 gap-3">
        <Text className="text-[#6b7fa3] font-MonMedium text-xs uppercase tracking-widest">
          Create
        </Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => router.push("/creator/upload")}
            className="flex-1 bg-primary rounded-2xl p-4 gap-2"
          >
            <Image source={icons.plus} className="w-5 h-5" tintColor="#fff" />
            <Text className="text-white font-MonBold text-sm">Upload Episode</Text>
            <Text className="text-white/60 font-MonRegular text-xs">
              Publish a pre-recorded audio file
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/(tabs)/creator-live")}
            className="flex-1 bg-[#16213e] rounded-2xl p-4 gap-2"
          >
            <Image source={icons.live} className="w-5 h-5" tintColor="#e63946" />
            <Text className="text-textPrimary font-MonBold text-sm">Go Live</Text>
            <Text className="text-[#6b7fa3] font-MonRegular text-xs">
              Stream live to your followers
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ─── Upcoming Streams ─── */}
      <View className="px-5 mt-7 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-[#6b7fa3] font-MonMedium text-xs uppercase tracking-widest">
            Upcoming Streams
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/creator-live")}>
            <Text className="text-primary font-MonMedium text-xs">
              View all
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View className="h-20 items-center justify-center">
            <ActivityIndicator color="#e63946" />
          </View>
        ) : upcomingStreams.length === 0 ? (
          <View className="bg-[#16213e] rounded-2xl p-5 items-center gap-3">
            <Text className="text-[#6b7fa3] font-MonRegular text-sm text-center">
              No upcoming streams scheduled
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/creator-live")}
              className="bg-primary px-5 py-2.5 rounded-xl"
            >
              <Text className="text-white font-MonBold text-sm">
                Schedule a Stream
              </Text>
            </Pressable>
          </View>
        ) : (
          upcomingStreams.map((stream) => (
            <UpcomingStreamCard key={stream.id} stream={stream} />
          ))
        )}
      </View>

      {/* ─── Recent Episodes ─── */}
      <View className="px-5 mt-7 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-[#6b7fa3] font-MonMedium text-xs uppercase tracking-widest">
            Recent Episodes
          </Text>
          {profile?.id && (
            <Pressable
              onPress={() => router.push(`/home/author/${profile.id}`)}
            >
              <Text className="text-primary font-MonMedium text-xs">
                View all
              </Text>
            </Pressable>
          )}
        </View>

        {episodesLoading || (loading && !profile) ? (
          <View className="h-20 items-center justify-center">
            <ActivityIndicator color="#e63946" />
          </View>
        ) : recentEpisodes.length === 0 ? (
          <View className="bg-[#16213e] rounded-2xl p-5 items-center">
            <Text className="text-[#6b7fa3] font-MonRegular text-sm">
              No episodes yet
            </Text>
          </View>
        ) : (
          recentEpisodes.map((ep) => (
            <View
              key={ep.id}
              className="flex-row items-center gap-3 bg-[#16213e] rounded-2xl p-3"
            >
              <Image
                source={
                  ep.thumbnail_url ? { uri: ep.thumbnail_url } : images.podDefault
                }
                className="w-12 h-12 rounded-xl"
              />
              <View className="flex-1">
                <Text
                  className="text-textPrimary font-MonBold text-sm"
                  numberOfLines={1}
                >
                  {ep.title}
                </Text>
                <Text className="text-[#6b7fa3] font-MonRegular text-xs mt-0.5">
                  {new Date(ep.published_at).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {formatDuration(ep.duration_seconds)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* ─── Analytics Coming Soon ─── */}
      <View className="px-5 mt-7">
        <View className="bg-[#16213e] border border-[#0f3460] rounded-3xl p-6 items-center gap-3">
          <Image source={icons.analyticsH} className="w-10 h-10 opacity-50" />
          <Text className="text-textPrimary font-MonBold text-base">
            Analytics
          </Text>
          <Text className="text-[#6b7fa3] font-MonRegular text-sm text-center">
            Detailed play counts, listener retention, and growth charts are on
            their way.
          </Text>
          <View className="bg-[#0f3460] px-4 py-1.5 rounded-full mt-1">
            <Text className="text-[#4a90e2] font-MonBold text-xs tracking-wider">
              COMING SOON
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
