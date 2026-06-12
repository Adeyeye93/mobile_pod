import PageHead from "@/components/PageHead";
import SearchHeader from "@/components/search/SearchHeader";
import Options from "@/components/search/options";
import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import { api } from "@/libs/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { CustomModal } from "@/components/modals/Modal";
import Preloader from "@/components/screen/preloader";
import Search from "../discover/search";
import { useInterest } from "@/context/InterestContext";
import { useSortFilter } from "@/components/modals/Sort";
import { useCategorySheet } from "@/context/CreateSheetContext";
import { useSearchHistory } from "@/hook/useSearchHistory";
import { useAudio } from "@/context/AudioPlayerContext";
import { usePlayer } from "@/context/PlayerContext";

const Discover = () => {
  const [isMoodLoading, setIsMoodLoading] = useState(true);
  const [mood, setMood] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState("");
  const { interests, loading } = useInterest();
  const { ref: sortRef } = useSortFilter();
  const { ref: categorySheetRef } = useCategorySheet();
  const { recordings, removeRecording } = useSearchHistory();
  const { loadTrack, toggle, currentTrack } = useAudio();
  const { ref: playerRef } = usePlayer();

  useEffect(() => {
    const loadMoods = async () => {
      try {
        setIsMoodLoading(true);

        const cached = await AsyncStorage.getItem("userMoods");
        if (cached) {
          setMood(JSON.parse(cached));
          setIsMoodLoading(false);
          return;
        }

        const response = await api.get("/get_mood");
        const moodsData = response.data.data || response.data.interests || [];
        setMood(moodsData);
        await AsyncStorage.setItem("userMoods", JSON.stringify(moodsData));
      } catch (error) {
        console.error("Error loading interests:", error);
        setMood([]);
      } finally {
        setIsMoodLoading(false);
      }
    };

    loadMoods();
  }, []);

  const openSearchWith = (name: string) => {
    setSelectedTerm(name);
    setModalVisible(true);
  };

  const handlePlay = (item: any) => {
    if (currentTrack?.id === item.id) {
      toggle();
    } else {
      loadTrack({
        id: item.id,
        title: item.title,
        creatorName: item.creator_name ?? "Unknown",
        thumbnail: item.thumbnail,
        creatorAvatar: item.creator_avatar,
        masterUrl: item.master_url,
        downloadUrl: item.download_url ?? null,
        durationSeconds: item.duration_seconds,
      });
    }
    playerRef.current?.expand();
  };

  if (isMoodLoading || loading) {
    return <Preloader />;
  }

  return (
    <View className="flex-1 bg-background px-4 pb-16">
      <PageHead
        title="Discover"
        has_profile
        has_menu
        iconsList={[icons.sort, icons.filter]}
        dropdownList={["Sort", "Filter by Category"]}
        onMenuSelect={(opt) => {
          if (opt === "Sort") sortRef.current?.expand();
          if (opt === "Filter by Category") categorySheetRef.current?.expand();
        }}
      />

      <Pressable
        onPress={() => openSearchWith("")}
        className="w-full h-16 bg-[#1f222b] rounded-2xl flex-row items-center justify-start gap-4 pl-6"
      >
        <Image tintColor="gray" className="w-6 h-6" source={icons.search} />
        <Text className="text-[gray] font-MonMedium">Search</Text>
      </Pressable>

      <SearchHeader icon={icons.pod} title="Categories" />
      <Options datas={interests} onSelect={openSearchWith} />

      <SearchHeader icon={icons.mood} title="Mood" />
      <Options datas={mood} onSelect={openSearchWith} />

      <SearchHeader icon={icons.speedRate} title="Recent Searches" />
      {recordings.length === 0 ? (
        <Text className="text-gray-500 font-MonRegular text-sm mt-2">
          No recent searches yet
        </Text>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="h-56"
          contentContainerStyle={{ gap: 10, paddingHorizontal: 5 }}
        >
          {recordings.map((item) => (
            <View
              key={item.id}
              className="w-full h-24 flex-row items-center justify-between"
            >
              <View className="flex-row h-full items-center gap-4 flex-1">
                <Image
                  className="h-full w-24 rounded-xl"
                  source={item.thumbnail ? { uri: item.thumbnail } : images.podDefault}
                />
                <View className="flex-1">
                  <Text numberOfLines={1} className="font-MonMedium text-textSecondary">
                    {item.title}
                  </Text>
                  <Text numberOfLines={1} className="font-MonMedium text-[gray] text-sm mt-1">
                    {item.creator_name}
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-4 items-center">
                <Pressable onPress={() => handlePlay(item)}>
                  <Image className="w-5 h-5" tintColor="#6b7280" source={icons.play} />
                </Pressable>
                <Pressable onPress={() => removeRecording(item.id)}>
                  <Image className="w-4 h-4" tintColor="#6b7280" source={icons.close} />
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <CustomModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedTerm("");
        }}
        title="Search"
        showCloseButton={true}
        animationType="fade"
      >
        <Search initialQuery={selectedTerm} />
      </CustomModal>
    </View>
  );
};

export default Discover;
