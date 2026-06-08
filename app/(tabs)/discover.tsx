import PageHead from "@/components/PageHead";
import SearchHeader from "@/components/search/SearchHeader";
import History from "@/components/search/history";
import Options from "@/components/search/options";
import { icons } from "@/constants/icons";
import { api } from "@/libs/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
// import { useRouter } from "expo-router";
import { CustomModal } from "@/components/modals/Modal";
import Preloader from "@/components/screen/preloader";
import Search from "../discover/search";
import { useInterest } from "@/context/InterestContext";
import { useSortFilter } from "@/components/modals/Sort";
import { useCategorySheet } from "@/context/CreateSheetContext";

const Discover = () => {
  // const [interests, setInterests] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);
  const [isMoodLoading, setIsMoodLoading] = useState(true);
  const [mood, setMood] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { interests, loading } = useInterest();
  const { ref: sortRef } = useSortFilter();
  const { ref: categorySheetRef } = useCategorySheet();

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

  if (isMoodLoading || loading) {
    return <Preloader />;
  } else {
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
          onPress={() => setModalVisible(true)}
          className="w-full h-16 bg-[#1f222b] rounded-2xl flex-row items-center justify-start gap-4 pl-6"
        >
          <Image tintColor="gray" className="w-6 h-6" source={icons.search} />
          <Text className="text-[gray] font-MonMedium">Search</Text>
        </Pressable>

        <SearchHeader icon={icons.pod} title="Categories" />
        <Options datas={interests} />
        <SearchHeader icon={icons.mood} title="Mood" />
        <Options datas={mood} />
        <SearchHeader icon={icons.speedRate} title="Resent Searchs" />
        <History />

        <CustomModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Search"
          showCloseButton={true}
          animationType="fade"
        >
          <Search />
        </CustomModal>
      </View>
    );
  }
};

export default Discover;
