import { View, Text, Pressable, Image } from "react-native";
import { useEffect, useState } from "react";
import PageHead from "@/components/PageHead";
import { images } from "@/constants/image";
import { icons } from "@/constants/icons";
import SearchHeader from "@/components/search/SearchHeader";
import Options from "@/components/search/options";
import { api } from "@/libs/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import History from "@/components/search/history";
import { useSearchSheet } from "@/context/CreateSheetContext";

const Discover = () => {
  const [interests, setInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoodLoading, setIsMoodLoading] = useState(true);
  const [mood, setMood] = useState([])

  useEffect(() => {
    const loadInterests = async () => {
      try {
        setIsLoading(true);

        const cached = await AsyncStorage.getItem("userInterests");
        if (cached) {
          setInterests(JSON.parse(cached));
          setIsLoading(false);
          return;
        }

        const response = await api.get("/interests");
        const interestsData =
          response.data.data || response.data.interests || [];

        setInterests(interestsData);

        await AsyncStorage.setItem(
          "userInterests",
          JSON.stringify(interestsData)
        );
      } catch (error) {
        console.error("Error loading interests:", error);
        setInterests([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInterests();
  }, []);

    useEffect(() => {
      const loadMoods = async () => {
        try {
          setIsLoading(true);

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

    const { ref: sheetRef } = useSearchSheet();


  return (
    <View className="flex-1 bg-background px-4 pb-16">
      <PageHead title="Discover" has_menu />

      <Pressable
        onPress={() => sheetRef.current?.expand()}
        className="w-full h-16 bg-[#1f222b] rounded-2xl flex-row items-center justify-start gap-4 pl-6"
      >
        <Image tintColor="gray" className="w-6 h-6" source={icons.search} />
        <Text className="text-[gray] font-MonMedium">Search</Text>
      </Pressable>
      <SearchHeader icon={icons.pod} title="Interest" />
      {isLoading ? (
        <Text className="text-textSecondary">Loading...</Text>
      ) : (
        <Options datas={interests} />
      )}
      <SearchHeader icon={icons.mood} title="Mood" />
      {isLoading ? (
        <Text className="text-textSecondary">Loading...</Text>
      ) : (
        <Options datas={mood} />
      )}
      <SearchHeader icon={icons.speedRate} title="Resent Searchs" />
      <History />
    </View>
  );
};

export default Discover;
