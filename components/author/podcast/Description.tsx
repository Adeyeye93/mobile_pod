import { View, Text, Pressable, Image, Modal, ScrollView } from "react-native";
import { useState } from "react";
import { icons } from "@/constants/icons";
import { useLibraryPlaylists } from "@/hook/useLibraryPlaylists";
import { useCustomPlaylists } from "@/hook/useCustomPlaylists";
import { useDownload } from "@/context/DownloadContext";
import { useToast } from "@/context/FlashMessageContext";
import { shareEpisode } from "@/utils/share";
import type { Recording } from "@/hook/useRecordings";

interface EpisodeDescriptionProps {
  recording: Recording;
}

export default function EpisodeDescription({ recording }: EpisodeDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const [playlistPickerVisible, setPlaylistPickerVisible] = useState(false);
  const { add, remove, isIn } = useLibraryPlaylists();
  const { playlists: customPlaylists, addToPlaylist } = useCustomPlaylists();
  const { download, removeDownload, isDownloaded: ctxIsDownloaded, isDownloading: ctxIsDownloading } = useDownload();
  const { show: showToast } = useToast();

  const isLiked = isIn("liked", recording.id);
  const isSaved = isIn("listenLater", recording.id);
  const isDownloaded = ctxIsDownloaded(recording.id);
  const inProgress = ctxIsDownloading(recording.id);
  const canDownload = !!recording.download_url;

  const handleShare = () => shareEpisode(recording.id, recording.title);

  const toggleLike = () =>
    isLiked ? remove("liked", recording.id) : add("liked", recording);

  const toggleSave = () =>
    isSaved ? remove("listenLater", recording.id) : add("listenLater", recording);

  const toggleDownload = () => {
    if (inProgress || !canDownload) return;
    if (isDownloaded) {
      removeDownload(recording.id);
    } else {
      download(recording);
    }
  };

  const handleAddToPlaylist = (playlistId: string, playlistName: string) => {
    addToPlaylist(playlistId, recording);
    setPlaylistPickerVisible(false);
    showToast({
      title: "Added",
      message: `"${recording.title}" added to ${playlistName}`,
      type: "success",
    });
  };

  return (
    <View className="p-4 gap-5">
      {/* Action row */}
      <View className="flex-row items-center justify-between">
        <ActionBtn
          icon={icons.saved}
          label="Like"
          active={isLiked}
          onPress={toggleLike}
        />
        <ActionBtn
          icon={icons.recentplayed}
          label="Save"
          active={isSaved}
          onPress={toggleSave}
        />
        <ActionBtn
          icon={isDownloaded ? icons.downloaded : icons.download}
          label={inProgress ? "..." : !canDownload ? "Processing" : "Download"}
          active={isDownloaded}
          disabled={!canDownload && !isDownloaded}
          onPress={toggleDownload}
        />
        <ActionBtn
          icon={icons.plus}
          label="Playlist"
          active={false}
          onPress={() => setPlaylistPickerVisible(true)}
        />
        <ActionBtn
          icon={icons.share}
          label="Share"
          active={false}
          onPress={handleShare}
        />
      </View>

      {/* Category + tags */}
      {(recording.category || recording.tags?.length > 0) && (
        <View className="flex-row flex-wrap gap-2">
          {recording.category && (
            <View className="bg-primary/20 rounded-full px-3 py-1">
              <Text className="text-primary font-MonMedium text-xs">
                {recording.category}
              </Text>
            </View>
          )}
          {recording.tags?.map((tag, i) => (
            <View key={i} className="bg-[#2a2f3a] rounded-full px-3 py-1">
              <Text className="text-textSecondary font-MonRegular text-xs">
                #{tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Description */}
      {!!recording.description && (
        <View className="gap-2">
          <Text className="text-textPrimary font-MonBold text-base">
            About this episode
          </Text>
          <Pressable onPress={() => setExpanded((v) => !v)}>
            <Text
              numberOfLines={expanded ? undefined : 4}
              className="text-textSecondary font-MonRegular text-sm leading-relaxed"
            >
              {recording.description}
            </Text>
            <Text className="text-primary font-MonMedium text-xs mt-1">
              {expanded ? "Show less" : "Show more"}
            </Text>
          </Pressable>
        </View>
      )}

      {/* ── Add to playlist picker ── */}
      <Modal
        visible={playlistPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPlaylistPickerVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" }}>
          <Pressable style={{ flex: 1 }} onPress={() => setPlaylistPickerVisible(false)} />

          <View
            style={{
              backgroundColor: "#1a1c24",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "60%",
            }}
          >
            {/* Handle */}
            <View className="items-center pt-3 pb-1">
              <View
                style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.18)" }}
              />
            </View>

            <Text className="text-textPrimary font-MonBold text-lg px-5 pt-3 pb-4">
              Add to playlist
            </Text>

            {customPlaylists.length === 0 ? (
              <View className="items-center py-10 px-5">
                <Text className="text-textSecondary font-MonRegular text-sm text-center">
                  You haven't created any playlists yet.{"\n"}Go to Library → + to create one.
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                {customPlaylists.map((playlist) => {
                  const alreadyIn = playlist.recordings.some((r) => r.id === recording.id);
                  return (
                    <Pressable
                      key={playlist.id}
                      onPress={() => !alreadyIn && handleAddToPlaylist(playlist.id, playlist.name)}
                      className="flex-row items-center px-5 py-4 gap-4"
                      style={alreadyIn ? { opacity: 0.45 } : undefined}
                    >
                      {/* Playlist cover (first episode thumbnail or placeholder) */}
                      <View
                        style={{
                          width: 48, height: 48, borderRadius: 10,
                          backgroundColor: "#2a2f3a",
                          alignItems: "center", justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {playlist.recordings[0]?.thumbnail ? (
                          <Image
                            source={{ uri: playlist.recordings[0].thumbnail }}
                            style={{ width: 48, height: 48 }}
                            resizeMode="cover"
                          />
                        ) : (
                          <Image
                            source={icons.queue}
                            style={{ width: 22, height: 22 }}
                            tintColor="#6b7280"
                          />
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text className="text-textPrimary font-MonBold text-sm" numberOfLines={1}>
                          {playlist.name}
                        </Text>
                        <Text className="text-[#6b7280] font-MonRegular text-xs mt-0.5">
                          {playlist.recordings.length} episode{playlist.recordings.length !== 1 ? "s" : ""}
                          {alreadyIn ? "  ·  Already added" : ""}
                        </Text>
                      </View>

                      {!alreadyIn && (
                        <Image
                          source={icons.plus}
                          style={{ width: 18, height: 18 }}
                          tintColor="#6b7280"
                        />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ActionBtn({
  icon,
  label,
  active,
  disabled,
  onPress,
}: {
  icon: any;
  label: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="items-center gap-1.5" style={disabled ? { opacity: 0.4 } : undefined}>
      <View
        className={`w-12 h-12 rounded-full items-center justify-center ${
          active ? "bg-primary/20" : "bg-[#2a2f3a]"
        }`}
      >
        <Image
          className="w-5 h-5"
          tintColor={active ? "#4169e1" : "#6b7280"}
          source={icon}
        />
      </View>
      <Text
        className={`font-MonRegular text-[10px] ${
          active ? "text-primary" : "text-gray-500"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
