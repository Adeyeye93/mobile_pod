import { View, Text, Image, Pressable } from "react-native";
import { icons } from "@/constants/icons";
import { LivePulse } from "./LivePulse";
import CreatorCover from "./CreatorCover";
import LiveChannelName from "./LiveChannelName";
import { useRouter } from "expo-router";
import type { LiveStream } from "@/hook/useLiveStreams";

const timeClass = "text-textSecondary font-MonMedium text-sm";
const listenerImageClass = "w-8 h-8 rounded-full -ml-3 border border-[#1E4D5F]";

interface LiveCardProps {
  stream: LiveStream;
  minimal?: boolean;
  IsSuggested?: boolean;
  Suggestion?: string;
}

const Livecard = ({
  stream,
  minimal,
  IsSuggested,
  Suggestion,
}: LiveCardProps) => {
  const router = useRouter();

  const handleConnect = () => {
    router.push({
      pathname: "/live/Listener",
      params: {
        streamId: stream.id,
        title: stream.title,
        creatorName: stream.creator_name ?? "Unknown",
        creatorAvatar: stream.creator_avatar ?? "",
        masterUrl: stream.master_url,
      },
    });
  };

  // Format duration from actual_start_time to now
  const duration = (() => {
    if (!stream.actual_start_time) return null;
    const start = new Date(stream.actual_start_time).getTime();
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")} mins`;
  })();

  const viewerLabel =
    stream.viewer_count >= 1000
      ? `+${(stream.viewer_count / 1000).toFixed(1)}k`
      : `${stream.viewer_count}`;

  return (
    <View className="flex-col gap-2 mt-2 w-full">
      {/* LIVE LABEL */}
      {minimal ? (
        <View className="flex-row items-center gap-2 px-1" />
      ) : (
        <View className="flex-row items-center gap-2 px-1">
          <LivePulse />
          <Text className="text-xs font-semibold tracking-wide text-cyan-400">
            LIVE
          </Text>
        </View>
      )}

      {/* CARD */}
      <Pressable
        className="w-full rounded-xl bg-[#1E4D5F] px-3 py-3"
        onPress={handleConnect}
      >
        {IsSuggested && (
          <Text className="text-xs font-semibold tracking-wide text-cyan-400 mb-4 uppercase">
            {Suggestion ?? "SUGGESTED BY POD"}
          </Text>
        )}

        {/* TOP SECTION */}
        <View className="flex-row justify-between items-start">
          <View className="flex-row gap-4 flex-1">
            {/* COVER — pass creator avatar as prop */}
            <CreatorCover
              creators={
                stream.creator_avatar ? [{ uri: stream.creator_avatar }] : []
              }
            />

            {/* TITLE + META */}
            <View className="flex-1">
              <Text
                numberOfLines={2}
                className="font-MonBold text-textPrimary text-lg"
              >
                {stream.title}
              </Text>

              <LiveChannelName
                channelNames={[stream.creator_name ?? stream.channel_id]}
              />

              <View className="flex-row items-center gap-2 mt-1">
                <Text className={timeClass}>{stream.category}</Text>
                {duration && (
                  <>
                    <Text className={timeClass}>•</Text>
                    <Text className={timeClass}>{duration}</Text>
                  </>
                )}
              </View>
            </View>
          </View>

          <Image source={icons.menu} className="w-6 h-6 opacity-80" />
        </View>

        {/* LISTENERS */}
        <View className="flex-row items-center gap-2 mt-4">
          {/* Static avatars — replace with real listener avatars if available */}
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-[#0f3460]" />
            <View className="w-8 h-8 rounded-full bg-[#0f3460] -ml-3 border border-[#1E4D5F]" />
            <View className="w-8 h-8 rounded-full bg-[#0f3460] -ml-3 border border-[#1E4D5F]" />
          </View>

          <Text className="text-textPrimary font-MonMedium">
            {viewerLabel}{" "}
            <Text className="text-secondary font-MonRegular text-sm">
              listening
            </Text>
          </Text>
        </View>

        {/* ACTION AREA */}
        {!minimal && (
          <View className="mt-4 h-12 rounded-lg border border-white/10 flex-row items-center justify-center">
            <Text className="text-textPrimary font-MonMedium">
              Tap to join live
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
};

export default Livecard;
