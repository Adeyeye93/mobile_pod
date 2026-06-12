import { icons } from "@/constants/icons";
import { usePlayListContent, usePlayListModal } from "@/context/ModalIntances";
import type { useLibraryPlaylists, PlaylistType } from "@/hook/useLibraryPlaylists";
import type { useCustomPlaylists, CustomPlaylist } from "@/hook/useCustomPlaylists";
import type { Recording } from "@/hook/useRecordings";
import { useSearchHistory } from "@/hook/useSearchHistory";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Grid from "./OrderStyle/Grid";

function getCreatorImages(recordings: Recording[]): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const r of recordings) {
    if (r.creator_id && !seen.has(r.creator_id) && r.creator_avatar) {
      seen.add(r.creator_id);
      urls.push(r.creator_avatar);
      if (urls.length === 3) break;
    }
  }
  return urls;
}

interface Props {
  color?: any;
  searchQuery?: string;
  library: ReturnType<typeof useLibraryPlaylists>;
  customLibrary: ReturnType<typeof useCustomPlaylists>;
}

export default function Playlists({ color, searchQuery = "", library, customLibrary }: Props) {
  const { open } = usePlayListModal();
  const { setData, setLoading, setTittle, setMeta } = usePlayListContent();
  const { liked, archive, listenLater, loading: libraryLoading, getList } = library;
  const { recordings: recentlyPlayed } = useSearchHistory();
  const { playlists: customPlaylists, deletePlaylist } = customLibrary;

  const handlePress = (tittle: string, type: PlaylistType | "recentlyPlayed") => {
    setTittle(tittle);
    setLoading(libraryLoading);
    const items = type === "recentlyPlayed" ? recentlyPlayed : getList(type);
    setData(items);
    open();
  };

  const handleCustomPress = (playlist: CustomPlaylist) => {
    setLoading(true);
    try {
      setTittle(playlist.name);
      setData(playlist.recordings);
      setMeta({ playlistId: playlist.id, addToPlaylist: customLibrary.addToPlaylist });
      open();
    } finally {
      setLoading(false);
    }
  };

  const q = searchQuery.toLowerCase();

  const systemPlaylists = [
    { type: "liked" as PlaylistType,        label: "Liked Podcasts",  icon: icons.saved,        count: liked.length },
    { type: "archive" as PlaylistType,      label: "Archive",         icon: icons.arc,          count: archive.length },
    { type: "listenLater" as PlaylistType,  label: "Listen Later",    icon: icons.recentplayed, count: listenLater.length },
    { type: "recentlyPlayed" as const,      label: "Recently Played", icon: icons.playlater,    count: recentlyPlayed.length },
  ].filter((p) => !q || p.label.toLowerCase().includes(q));

  const filteredCustom = customPlaylists.filter(
    (p) => !q || p.name.toLowerCase().includes(q)
  );

  return (
    <ScrollView
      contentContainerStyle={{
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        flexWrap: "wrap",
        gap: 25,
        padding: 12,
      }}
    >
      {systemPlaylists.map((p) => (
        <Grid
          key={p.type}
          color={color}
          icon={p.icon}
          use_icon
          Type={p.label as any}
          episodeCount={p.count}
          onPress={() => handlePress(p.label, p.type)}
        />
      ))}

      {filteredCustom.map((p) => (
        <View key={p.id} className="relative">
          <Grid
            non_icon
            author={p.name}
            episodeCount={p.recordings.length}
            creatorImages={getCreatorImages(p.recordings)}
            onPress={() => handleCustomPress(p)}
          />
          <Pressable
            onPress={() => deletePlaylist(p.id)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-[#2a2f3a] rounded-full items-center justify-center"
          >
            <Image
              className="w-3 h-3"
              tintColor="#6b7280"
              source={icons.close}
            />
          </Pressable>
        </View>
      ))}

      {q && systemPlaylists.length === 0 && filteredCustom.length === 0 && (
        <View className="w-full items-center mt-10">
          <Text className="text-gray-500 font-MonRegular text-sm">
            No playlists match &quot;{searchQuery}&quot;
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
