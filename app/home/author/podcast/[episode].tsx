import { View, Text, Image, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import PageHead from "@/components/PageHead";
import Timer from "@/components/author/timer";
import PlayPauseButton from "@/components/playPauseButton";
import EpisodeDescription from "@/components/author/podcast/Description";
import { useRecording } from "@/hook/useRecording";
import { useAudio } from "@/context/AudioPlayerContext";
import { usePlayer } from "@/context/PlayerContext";
import { useImageColors } from "@/hook/useImageColors";
import { shareEpisode } from "@/utils/share";

function EpisodeSkeleton() {
  return (
    <View className="flex-1 bg-background px-4">
      <View className="w-full h-72 rounded-3xl bg-white/5 mt-4" />
      <View className="mt-5 gap-3">
        <View className="h-6 w-3/4 rounded-full bg-white/5" />
        <View className="h-4 w-1/2 rounded-full bg-white/5" />
        <View className="h-4 w-1/3 rounded-full bg-white/5" />
      </View>
    </View>
  );
}

const Episode = () => {
  const { episode: id } = useLocalSearchParams<{ episode: string }>();
  const router = useRouter();
  const { recording, loading, error } = useRecording(id);
  const { loadTrack, toggle, currentTrack, status } = useAudio();
  const { ref: playerRef } = usePlayer();

  const thumbnailSource = recording?.thumbnail
    ? { uri: recording.thumbnail }
    : images.podDefault;
  const colors = useImageColors(thumbnailSource);

  const isThisTrack = currentTrack?.id === recording?.id;
  const isPlaying = isThisTrack && status.playing;

  const handlePlay = () => {
    if (!recording) return;
    if (isThisTrack) {
      toggle();
    } else {
      loadTrack({
        id: recording.id,
        title: recording.title,
        creatorName: recording.creator_name ?? "Unknown",
        creatorId: recording.creator_id,
        thumbnail: recording.thumbnail,
        creatorAvatar: recording.creator_avatar,
        masterUrl: recording.master_url,
        downloadUrl: recording.download_url,
        durationSeconds: recording.duration_seconds,
      });
    }
    playerRef.current?.expand();
  };

  if (loading) return <EpisodeSkeleton />;

  if (error || !recording) {
    return (
      <View className="flex-1 bg-background px-4 items-center justify-center">
        <Text className="text-textSecondary font-MonRegular text-center">
          {error ?? "Episode not found."}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Colour-extracted gradient banner */}
      <View
        className="absolute top-0 left-0 right-0 h-72 z-0 overflow-hidden"
        style={{ backgroundColor: colors?.colorOne.value }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(24,26,32,0.6)", "rgba(24,26,32,1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="w-full h-full"
        />
      </View>

      <View className="px-4 z-10 flex-1">
        <PageHead
          title=""
          has_menu
          iconsList={[icons.share, icons.report]}
          dropdownList={["Share", "Report"]}
          onMenuSelect={(opt) => {
            if (opt === "Share")
              shareEpisode(recording.id, recording.title);
          }}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Thumbnail */}
          <View className="w-full aspect-square rounded-3xl overflow-hidden mt-2 max-h-72">
            <Image
              source={thumbnailSource}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Title + creator */}
          <View className="mt-5 gap-2">
            <Text
              className="text-textPrimary font-MonBold text-2xl"
              numberOfLines={3}
            >
              {recording.title}
            </Text>

            <Pressable
              onPress={() =>
                recording.creator_id &&
                router.push(`/home/author/${recording.creator_id}` as any)
              }
            >
              <Text className="text-textSecondary font-MonMedium text-sm">
                {recording.creator_name ?? "Unknown"}
              </Text>
            </Pressable>
          </View>

          <Timer
            publishedAt={recording.actual_start_time}
            durationSeconds={recording.duration_seconds}
          />

          <PlayPauseButton
            Playing={isPlaying}
            Completed={false}
            onPlay={handlePlay}
          />

          <EpisodeDescription recording={recording} />
        </ScrollView>
      </View>
    </View>
  );
};

export default Episode;
