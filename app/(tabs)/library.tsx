import Author from "@/components/library/tabs/Author";
import Downloaded from "@/components/library/tabs/Downloaded";
import Playlists from "@/components/library/tabs/Playlists";
import PageHead from "@/components/PageHead";
import { CustomModal } from "@/components/modals/Modal";
import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import { useCustomPlaylists } from "@/hook/useCustomPlaylists";
import { useLibraryPlaylists } from "@/hook/useLibraryPlaylists";
import { useImageColors } from "@/hook/useImageColors";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import {
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type TabType = "playlists" | "author" | "downloaded";

const TABS: { id: TabType; label: string }[] = [
  { id: "playlists", label: "Playlists" },
  { id: "author", label: "Author" },
  { id: "downloaded", label: "Downloaded" },
];

const Library = () => {
  const colors = useImageColors(images.profile);
  const [activeTab, setActiveTab] = useState<TabType>("playlists");
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPlaylistVisible, setNewPlaylistVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const customLibrary = useCustomPlaylists();
  const library = useLibraryPlaylists();
  const searchInputRef = useRef<TextInput>(null);

  const toggleSearch = () => {
    if (searchVisible) {
      setSearchQuery("");
      setSearchVisible(false);
    } else {
      setSearchVisible(true);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    customLibrary.createPlaylist(newPlaylistName);
    setNewPlaylistName("");
    setNewPlaylistVisible(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "playlists":
        return <Playlists color={colors} searchQuery={searchQuery} library={library} customLibrary={customLibrary} />;
      case "author":
        return <Author searchQuery={searchQuery} />;
      case "downloaded":
        return <Downloaded searchQuery={searchQuery} />;
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-background pb-16">
      <View
        className="w-full h-fit"
        style={{ backgroundColor: colors.colorOne.value }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(24,26,32,0.5)", "rgba(24,26,32,1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="w-full h-full absolute inset-0"
        />
        <PageHead
          has_profile
          title="Your Library"
          customIcons={[
            {
              icon: icons.search,
              onPress: toggleSearch,
              testID: "search-btn",
            },
            {
              icon: icons.plus,
              onPress: () => setNewPlaylistVisible(true),
              testID: "add-playlist-btn",
            },
          ]}
        />
      </View>

      {/* Inline search bar */}
      {searchVisible && (
        <View className="px-4 py-2 bg-background border-b border-[#2a2f3a]">
          <View className="flex-row items-center bg-[#1f222b] rounded-2xl px-4 h-12 gap-3">
            <Image tintColor="#6b7280" className="w-5 h-5" source={icons.search} />
            <TextInput
              ref={searchInputRef}
              className="flex-1 font-MonMedium text-textPrimary h-full"
              placeholder={`Search ${activeTab}...`}
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Image className="w-4 h-4" tintColor="#6b7280" source={icons.close} />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Tab bar */}
      <View className="w-full border-b border-[#2a2f3a]">
        <View className="flex-row items-center">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => {
                  setActiveTab(tab.id);
                  setSearchQuery("");
                }}
                className="flex-1 py-4 items-center justify-center"
              >
                <Text
                  className={`font-MonBold text-lg ${
                    isActive ? "text-primary" : "text-textSecondary"
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View className="flex-row">
          {TABS.map((tab) => (
            <View key={`indicator-${tab.id}`} className="flex-1 h-1 bg-[#2a2f3a00]">
              {activeTab === tab.id && <View className="flex-1" />}
            </View>
          ))}
        </View>
      </View>

      <View className="flex-1">{renderTabContent()}</View>

      {/* New Playlist modal */}
      <CustomModal
        visible={newPlaylistVisible}
        onClose={() => {
          setNewPlaylistVisible(false);
          setNewPlaylistName("");
        }}
        title="New Playlist"
        showCloseButton
        animationType="fade"
      >
        <View className="px-2 pt-4 gap-4">
          <View className="bg-[#1f222b] rounded-2xl px-4 h-14 flex-row items-center">
            <TextInput
              className="flex-1 font-MonMedium text-textPrimary h-full"
              placeholder="Playlist name..."
              placeholderTextColor="#6b7280"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              returnKeyType="done"
              onSubmitEditing={handleCreatePlaylist}
              autoFocus
            />
          </View>
          <Pressable
            onPress={handleCreatePlaylist}
            className={`h-14 rounded-2xl items-center justify-center ${
              newPlaylistName.trim() ? "bg-primary" : "bg-[#2a2f3a]"
            }`}
          >
            <Text className="font-MonBold text-textPrimary text-base">
              Create Playlist
            </Text>
          </Pressable>
        </View>
      </CustomModal>
    </View>
  );
};

export default Library;
