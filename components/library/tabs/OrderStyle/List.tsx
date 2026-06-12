import { View, Text, Image, Pressable, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";
import { images } from "@/constants/image";
import { icons } from "@/constants/icons";
import { useAudio } from "@/context/AudioPlayerContext";
import { usePlayer } from "@/context/PlayerContext";
import { useDownload } from "@/context/DownloadContext";
import type { Recording } from "@/hook/useRecordings";

interface ListProps {
  item: Recording;
  onRemove?: (id: string) => void;
  onPress?: () => void;
  hideDownload?: boolean;
}

function formatDuration(seconds: number): string {
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")} mins`;
}

const List = ({ item, onRemove, onPress: onPressProp, hideDownload }: ListProps) => {
  const { loadTrack, toggle, currentTrack } = useAudio();
  const { ref: playerRef } = usePlayer();
  const { download, removeDownload, isDownloaded, isDownloading, getLocalUri } = useDownload();

  const isActive = currentTrack?.id === item.id;
  const downloaded = isDownloaded(item.id);
  const inProgress = isDownloading(item.id);

  const handlePress = () => {
    if (onPressProp) {
      onPressProp();
      return;
    }
    if (isActive) {
      toggle();
    } else {
      loadTrack({
        id: item.id,
        title: item.title,
        creatorName: item.creator_name ?? "Unknown",
        thumbnail: item.thumbnail,
        creatorAvatar: item.creator_avatar,
        masterUrl: item.master_url,
        downloadUrl: item.download_url,
        localUri: getLocalUri(item.id) ?? undefined,
        durationSeconds: item.duration_seconds,
      });
    }
    playerRef.current?.expand();
  };

  const handleDownloadPress = () => {
    if (downloaded) {
      removeDownload(item.id);
    } else if (!inProgress) {
      download(item);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="w-full h-16 flex-row items-center justify-between p-2"
    >
      <View className="flex-1 h-full flex-row items-center justify-start gap-3">
        <Image
          className="h-14 w-14 rounded-lg"
          source={item.thumbnail ? { uri: item.thumbnail } : images.podDefault}
        />
        <View className="flex-1 h-full flex-col items-start justify-evenly">
          <Text
            className="text-textPrimary font-MonBold capitalize"
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <View className="flex-row items-center gap-1.5">
            {downloaded && (
              <Image className="w-3 h-3" tintColor="#4169e1" source={icons.downloaded} />
            )}
            <Text
              className="text-textSecondary font-MonMedium text-xs"
              numberOfLines={1}
            >
              {item.creator_name}
              {item.duration_seconds > 0
                ? ` · ${formatDuration(item.duration_seconds)}`
                : ""}
            </Text>
          </View>
        </View>
      </View>

      {onRemove && (
        <Pressable
          onPress={() => onRemove(item.id)}
          className="h-full w-10 flex-row items-center justify-center"
        >
          <Image
            className="w-5 h-5"
            tintColor="#6b7280"
            source={icons.close}
          />
        </Pressable>
      )}

      {!hideDownload && !onRemove && !!item.download_url && (
        <Pressable
          onPress={handleDownloadPress}
          className="h-full w-10 flex-row items-center justify-center"
        >
          {inProgress ? (
            <ActivityIndicator size={18} color="#4169e1" />
          ) : (
            <Image
              className="w-5 h-5"
              tintColor={downloaded ? "#4169e1" : "#6b7280"}
              source={downloaded ? icons.downloaded : icons.download}
            />
          )}
        </Pressable>
      )}

      <Pressable
        onPress={handlePress}
        className="h-full w-10 flex-row items-center justify-center"
      >
        <Image
          className="w-6 h-6"
          tintColor={isActive ? "#fff" : "#6b7280"}
          source={isActive ? icons.pause : icons.play}
        />
      </Pressable>
    </TouchableOpacity>
  );
};

export default List;
