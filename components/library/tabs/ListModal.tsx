import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  Modal,
  Platform,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import { useAudio } from "@/context/AudioPlayerContext";
import { usePlayer } from "@/context/PlayerContext";
import { usePlayListContent, usePlayListModal } from "@/context/ModalIntances";
import { useToast } from "@/context/FlashMessageContext";
import { useSearch } from "@/hook/useSearch";
import type { Recording } from "@/hook/useRecordings";

type SortMode = "default" | "az" | "za" | "creator";

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: "default",  label: "Default order" },
  { id: "az",      label: "Title A → Z" },
  { id: "za",      label: "Title Z → A" },
  { id: "creator", label: "By creator" },
];

// Colored banner config for system playlists — matches the library grid cards
type SystemBanner = { bg: string; gradientEnd: string; icon: any };
const SYSTEM_BANNERS: Record<string, SystemBanner> = {
  "Liked Podcasts":  { bg: "#EC4899", gradientEnd: "#9d174d", icon: icons.saved },
  "Archive":         { bg: "#06B6D4", gradientEnd: "#155e75", icon: icons.arc },
  "Listen Later":    { bg: "#4F46E5", gradientEnd: "#1e1b4b", icon: icons.recentplayed },
  "Recently Played": { bg: "#F59E0B", gradientEnd: "#78350f", icon: icons.playlater },
};

const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;
const HEADER_HEIGHT = 300;

// ── helpers ──────────────────────────────────────────────────────────────────

function applySortAndFilter(
  items: Recording[],
  sort: SortMode,
  query: string,
): Recording[] {
  let list = query.trim()
    ? items.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          (r.creator_name ?? "").toLowerCase().includes(query.toLowerCase()),
      )
    : [...items];

  switch (sort) {
    case "az":      list.sort((a, b) => a.title.localeCompare(b.title)); break;
    case "za":      list.sort((a, b) => b.title.localeCompare(a.title)); break;
    case "creator": list.sort((a, b) => (a.creator_name ?? "").localeCompare(b.creator_name ?? "")); break;
  }
  return list;
}

function toTrackMeta(r: Recording) {
  return {
    id: r.id,
    title: r.title,
    creatorName: r.creator_name ?? "Unknown",
    creatorId: r.creator_id,
    thumbnail: r.thumbnail,
    creatorAvatar: r.creator_avatar,
    masterUrl: r.master_url,
    downloadUrl: r.download_url,
    durationSeconds: r.duration_seconds,
  };
}

function formatDuration(seconds: number): string {
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatTotalDuration(seconds: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} hr${m > 0 ? ` ${m} min` : ""}`;
  return `${m} min`;
}

// ── Track row ─────────────────────────────────────────────────────────────────

interface TrackItemProps {
  item: Recording;
  index: number;
  onPlay: (index: number) => void;
  isActive: boolean;
  isPlaying: boolean;
}

function TrackItem({ item, index, onPlay, isActive, isPlaying }: TrackItemProps) {
  return (
    <Pressable
      onPress={() => onPlay(index)}
      className="flex-row items-center px-5 py-3 gap-4"
      style={isActive ? { backgroundColor: "rgba(230,57,70,0.07)" } : undefined}
    >
      {/* Thumbnail */}
      <View>
        <Image
          source={item.thumbnail ? { uri: item.thumbnail } : images.podDefault}
          style={{ width: 56, height: 56, borderRadius: 12 }}
          resizeMode="cover"
        />
        {isActive && (
          <View
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              borderRadius: 12,
              backgroundColor: "rgba(0,0,0,0.45)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              style={{ width: 20, height: 20 }}
              tintColor="#e63946"
              source={isPlaying ? icons.pause : icons.play}
            />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text
          className={`font-MonBold text-sm ${isActive ? "text-primary" : "text-textPrimary"}`}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text className="text-[#6b7280] font-MonRegular text-xs mt-0.5" numberOfLines={1}>
          {item.creator_name ?? "Unknown"}
          {item.duration_seconds > 0 ? ` · ${formatDuration(item.duration_seconds)}` : ""}
        </Text>
      </View>

      {/* Menu */}
      <Pressable hitSlop={10} className="p-1">
        <Image style={{ width: 16, height: 16 }} tintColor="#4b5563" source={icons.menu} />
      </Pressable>
    </Pressable>
  );
}

// ── Loading skeleton row ───────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <View className="flex-row items-center px-5 py-3 gap-4">
      <View
        style={{
          width: 56, height: 56, borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.06)",
        }}
      />
      <View style={{ flex: 1, gap: 8 }}>
        <View
          style={{
            height: 13, borderRadius: 6, width: "72%",
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        />
        <View
          style={{
            height: 11, borderRadius: 6, width: "48%",
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        />
      </View>
    </View>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

const ListModal = () => {
  const { isOpen, close } = usePlayListModal();
  const { status, currentTrack, shuffle, toggleShuffle, loadPlaylist, queue } = useAudio();
  const { ref: playerRef } = usePlayer();
  const { data, loading, tittle, meta } = usePlayListContent();
  const { show } = useToast();

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [addQuery, setAddQuery] = useState("");
  const [localAdditions, setLocalAdditions] = useState<Recording[]>([]);

  const { results: searchResults, loading: searchLoading } = useSearch(addQuery);

  useEffect(() => {
    if (!isOpen) {
      setSearchVisible(false);
      setSearchQuery("");
      setSortMode("default");
      setSortMenuVisible(false);
      setAddSheetVisible(false);
      setAddQuery("");
      setLocalAdditions([]);
    }
  }, [isOpen]);

  const baseRecordings = useMemo<Recording[]>(
    () => (Array.isArray(data) ? data : []),
    [data],
  );

  const recordings = useMemo<Recording[]>(
    () => [...localAdditions, ...baseRecordings],
    [localAdditions, baseRecordings],
  );

  const handleAddEpisode = (recording: Recording) => {
    if (recordings.some((r) => r.id === recording.id)) return;
    meta?.addToPlaylist?.(meta.playlistId, recording);
    setLocalAdditions((prev) => [recording, ...prev]);
    show({ title: "Added", message: `"${recording.title}" added to playlist`, type: "success" });
  };

  const filtered = useMemo(
    () => applySortAndFilter(recordings, sortMode, searchQuery),
    [recordings, sortMode, searchQuery],
  );

  const totalDuration = useMemo(
    () => recordings.reduce((s, r) => s + (r.duration_seconds ?? 0), 0),
    [recordings],
  );

  const systemBanner: SystemBanner | null = tittle ? (SYSTEM_BANNERS[tittle] ?? null) : null;

  const coverSource = recordings[0]?.thumbnail
    ? { uri: recordings[0].thumbnail }
    : images.podDefault;

  const handlePlay = async (index: number) => {
    await loadPlaylist(filtered.map(toTrackMeta), index);
    playerRef.current?.expand();
  };

  const handlePlayAll = async () => {
    if (!filtered.length) return;
    await loadPlaylist(filtered.map(toTrackMeta), 0);
    playerRef.current?.expand();
    show({
      title: shuffle ? "Shuffling" : "Playing",
      message: `${filtered.length} episode${filtered.length !== 1 ? "s" : ""} queued`,
      type: "success",
    });
  };

  return (
    <Modal
      visible={isOpen}
      transparent={false}
      animationType="slide"
      onRequestClose={close}
    >
      <View style={{ flex: 1, backgroundColor: "#111318" }}>

        {/* ── Cover header ─────────────────────────────────────────────── */}
        <View style={{ height: HEADER_HEIGHT + STATUS_BAR_HEIGHT }}>

          {systemBanner ? (
            /* ── System playlist: colored gradient banner ── */
            <LinearGradient
              colors={[systemBanner.bg, systemBanner.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            />
          ) : (
            /* ── Custom playlist: blurred episode thumbnail ── */
            <>
              <Image
                source={coverSource}
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                resizeMode="cover"
                blurRadius={20}
              />
              <View
                style={{
                  position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(8,9,14,0.55)",
                }}
              />
            </>
          )}

          {/* Shared bottom gradient fade into page bg */}
          <LinearGradient
            colors={["transparent", "rgba(17,19,24,0.6)", "#111318"]}
            start={{ x: 0, y: 0.35 }}
            end={{ x: 0, y: 1 }}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Back button */}
          <View style={{ paddingTop: STATUS_BAR_HEIGHT + 12, paddingHorizontal: 20 }}>
            <Pressable
              onPress={close}
              style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Image style={{ width: 18, height: 18 }} tintColor="#fff" source={icons.backPage} />
            </Pressable>
          </View>

          {/* Center: icon card (system) or album art (custom) */}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            {systemBanner ? (
              /* Colored icon card — mirrors the library grid tile */
              <View
                style={{
                  width: 130, height: 130, borderRadius: 24,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  alignItems: "center", justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 12,
                }}
              >
                <Image
                  source={systemBanner.icon}
                  style={{ width: 64, height: 64 }}
                  tintColor="rgba(255,255,255,0.92)"
                />
              </View>
            ) : (
              /* Episode thumbnail */
              <View
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.6,
                  shadowRadius: 24,
                  elevation: 20,
                }}
              >
                <Image
                  source={coverSource}
                  style={{ width: 140, height: 140, borderRadius: 20 }}
                  resizeMode="cover"
                />
              </View>
            )}
          </View>

          {/* Title row at bottom of header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingBottom: 20,
            }}
          >
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text
                style={{ color: "#fff", fontFamily: "bold", fontSize: 22 }}
                numberOfLines={1}
              >
                {tittle ?? "Playlist"}
              </Text>
              <Text style={{ color: "#9ca3af", fontFamily: "regular", fontSize: 13, marginTop: 3 }}>
                {recordings.length} track{recordings.length !== 1 ? "s" : ""}
                {totalDuration > 0 ? `  ·  ${formatTotalDuration(totalDuration)}` : ""}
              </Text>
            </View>

            {/* Shuffle + Play all */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Pressable
                onPress={toggleShuffle}
                style={{
                  width: 44, height: 44, borderRadius: 22,
                  alignItems: "center", justifyContent: "center",
                  backgroundColor: shuffle ? "rgba(230,57,70,0.18)" : "rgba(255,255,255,0.1)",
                  borderWidth: 1,
                  borderColor: shuffle ? "#e63946" : "rgba(255,255,255,0.15)",
                }}
              >
                <Image
                  style={{ width: 20, height: 20 }}
                  tintColor={shuffle ? "#e63946" : "#9ca3af"}
                  source={icons.random}
                />
              </Pressable>

              <Pressable
                onPress={handlePlayAll}
                style={{
                  width: 52, height: 52, borderRadius: 26,
                  backgroundColor: "#e63946",
                  alignItems: "center", justifyContent: "center",
                  shadowColor: "#e63946",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 8,
                }}
              >
                <Image
                  style={{ width: 20, height: 20 }}
                  tintColor="#fff"
                  source={status.playing ? icons.pause : icons.play}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Toolbar ────────────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: "#111318",
          }}
        >
          <Text style={{ color: "#6b7280", fontFamily: "regular", fontSize: 12 }}>
            {filtered.length} episode{filtered.length !== 1 ? "s" : ""}
            {searchQuery ? ` matching "${searchQuery}"` : ""}
            {shuffle ? "  ·  Shuffle on" : ""}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
            <Pressable
              onPress={() => {
                setSearchVisible((v) => !v);
                if (searchVisible) setSearchQuery("");
              }}
            >
              <Image
                style={{ width: 18, height: 18 }}
                tintColor={searchVisible ? "#e63946" : "#6b7280"}
                source={icons.search}
              />
            </Pressable>

            <Pressable onPress={() => setSortMenuVisible((v) => !v)}>
              <Image
                style={{ width: 18, height: 18 }}
                tintColor={sortMode !== "default" ? "#e63946" : "#6b7280"}
                source={icons.filter}
              />
            </Pressable>

            {meta?.playlistId && (
              <Pressable onPress={() => setAddSheetVisible(true)}>
                <Image
                  style={{ width: 18, height: 18 }}
                  tintColor="#6b7280"
                  source={icons.plus}
                />
              </Pressable>
            )}

            {queue.length > 0 && (
              <View>
                <Image style={{ width: 18, height: 18 }} tintColor="#6b7280" source={icons.queue} />
                <View
                  style={{
                    position: "absolute", top: -6, right: -6,
                    backgroundColor: "#e63946", borderRadius: 8,
                    minWidth: 16, height: 16,
                    alignItems: "center", justifyContent: "center",
                    paddingHorizontal: 2,
                  }}
                >
                  <Text style={{ color: "#fff", fontFamily: "bold", fontSize: 9 }}>
                    {queue.length}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Search bar */}
        {searchVisible && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 8, backgroundColor: "#111318" }}>
            <View
              style={{
                flexDirection: "row", alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.07)",
                borderRadius: 14, paddingHorizontal: 12, height: 42, gap: 8,
              }}
            >
              <Image style={{ width: 14, height: 14 }} tintColor="#6b7280" source={icons.search} />
              <TextInput
                autoFocus
                style={{ flex: 1, color: "#f9fafb", fontFamily: "regular", fontSize: 14, height: "100%" }}
                placeholder="Search episodes..."
                placeholderTextColor="#6b7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Image style={{ width: 14, height: 14 }} tintColor="#6b7280" source={icons.close} />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Sort dropdown */}
        {sortMenuVisible && (
          <View style={{ backgroundColor: "#111318", paddingHorizontal: 20, paddingBottom: 8 }}>
          <View
            style={{
              backgroundColor: "#1f222b", borderRadius: 16,
              borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            {SORT_OPTIONS.map((opt, i) => (
              <Pressable
                key={opt.id}
                onPress={() => { setSortMode(opt.id); setSortMenuVisible(false); }}
                style={{
                  flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                  paddingHorizontal: 16, paddingVertical: 12,
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: "rgba(255,255,255,0.05)",
                }}
              >
                <Text
                  style={{
                    fontFamily: "medium", fontSize: 14,
                    color: sortMode === opt.id ? "#e63946" : "#9ca3af",
                  }}
                >
                  {opt.label}
                </Text>
                {sortMode === opt.id && (
                  <Image style={{ width: 16, height: 16 }} tintColor="#e63946" source={icons.selected} />
                )}
              </Pressable>
            ))}
          </View>
          </View>
        )}

        {/* Divider */}
        <View style={{ height: 0.5, backgroundColor: "rgba(255,255,255,0.08)" }} />

        {/* ── Track list ───────────────────────────────────────────────── */}
        {loading ? (
          <View style={{ paddingTop: 8, backgroundColor: "#111318" }}>
            {[0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)}
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#111318" }}>
            <Text style={{ color: "#6b7280", fontFamily: "regular", fontSize: 14 }}>
              {searchQuery ? `No results for "${searchQuery}"` : "Nothing here yet"}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={{ backgroundColor: "#111318" }}
            contentContainerStyle={{ paddingBottom: 80, paddingTop: 4 }}
          >
            {filtered.map((item, index) => (
              <TrackItem
                key={item.id}
                item={item}
                index={index}
                onPlay={handlePlay}
                isActive={currentTrack?.id === item.id}
                isPlaying={currentTrack?.id === item.id && status.playing}
              />
            ))}
          </ScrollView>
        )}

        {/* ── Add Episodes sheet ──────────────────────────────────────── */}
        <Modal
          visible={addSheetVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setAddSheetVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" }}>
            <Pressable style={{ flex: 1 }} onPress={() => setAddSheetVisible(false)} />

            <View
              style={{
                backgroundColor: "#1a1c24",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                maxHeight: "75%",
              }}
            >
              {/* Handle */}
              <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)" }} />
              </View>

              <Text style={{ color: "#f9fafb", fontFamily: "bold", fontSize: 18, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
                Add Episodes
              </Text>

              {/* Search input */}
              <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
                <View
                  style={{
                    flexDirection: "row", alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.07)",
                    borderRadius: 14, paddingHorizontal: 12, height: 44, gap: 8,
                  }}
                >
                  <Image style={{ width: 14, height: 14 }} tintColor="#6b7280" source={icons.search} />
                  <TextInput
                    autoFocus
                    style={{ flex: 1, color: "#f9fafb", fontFamily: "regular", fontSize: 14 }}
                    placeholder="Search podcasts..."
                    placeholderTextColor="#6b7280"
                    value={addQuery}
                    onChangeText={setAddQuery}
                  />
                  {addQuery.length > 0 && (
                    <Pressable onPress={() => setAddQuery("")}>
                      <Image style={{ width: 14, height: 14 }} tintColor="#6b7280" source={icons.close} />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Results */}
              {!addQuery.trim() ? (
                <View style={{ alignItems: "center", paddingVertical: 32 }}>
                  <Text style={{ color: "#6b7280", fontFamily: "regular", fontSize: 14 }}>
                    Type to search for episodes
                  </Text>
                </View>
              ) : searchLoading ? (
                <View style={{ paddingTop: 8, paddingBottom: 24 }}>
                  {[0, 1, 2].map((i) => <SkeletonRow key={i} />)}
                </View>
              ) : searchResults.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 32 }}>
                  <Text style={{ color: "#6b7280", fontFamily: "regular", fontSize: 14 }}>
                    {`No results for "${addQuery}"`}
                  </Text>
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 40 }}
                >
                  {searchResults.map((r) => {
                    const alreadyIn = recordings.some((e) => e.id === r.id);
                    return (
                      <Pressable
                        key={r.id}
                        onPress={() => !alreadyIn && handleAddEpisode(r)}
                        style={[
                          { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12, gap: 14 },
                          alreadyIn ? { opacity: 0.4 } : undefined,
                        ]}
                      >
                        <Image
                          source={r.thumbnail ? { uri: r.thumbnail } : images.podDefault}
                          style={{ width: 52, height: 52, borderRadius: 10 }}
                          resizeMode="cover"
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: "#f9fafb", fontFamily: "bold", fontSize: 13 }} numberOfLines={1}>
                            {r.title}
                          </Text>
                          <Text style={{ color: "#6b7280", fontFamily: "regular", fontSize: 11, marginTop: 2 }} numberOfLines={1}>
                            {r.creator_name ?? "Unknown"}
                            {alreadyIn ? "  ·  Already in playlist" : ""}
                          </Text>
                        </View>
                        {!alreadyIn && (
                          <Image style={{ width: 18, height: 18 }} tintColor="#6b7280" source={icons.plus} />
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
    </Modal>
  );
};

export default ListModal;
