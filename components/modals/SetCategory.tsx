import { icons } from "@/constants/icons";
import {
  CategorySheetContext,
  Sheet,
  useCategorySheet,
} from "@/context/CreateSheetContext";
import { useStream } from "@/context/stream/StreamSetUp";
import { api } from "@/libs/api";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import Divider from "../divider";
import Preloader from "../screen/preloader";

const FALLBACK_CATEGORIES = [
  { id: "1", name: "Technology" },
  { id: "2", name: "Business" },
  { id: "3", name: "Education" },
  { id: "4", name: "Entertainment" },
  { id: "5", name: "Health & Wellness" },
  { id: "6", name: "News" },
  { id: "7", name: "Sports" },
  { id: "8", name: "Arts & Culture" },
  { id: "9", name: "Comedy" },
  { id: "10", name: "Science" },
  { id: "11", name: "Music" },
  { id: "12", name: "True Crime" },
  { id: "13", name: "Society & Culture" },
  { id: "14", name: "Religion & Spirituality" },
  { id: "15", name: "Politics" },
];

const SetCategory = () => {
  const { ref: categorySheetRef } = useCategorySheet();
  const { setCategory, category } = useStream();
  const [interests, setInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInterests = async () => {
      try {
        setIsLoading(true);

        const cached = await AsyncStorage.getItem("userInterests");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.length > 0) {
            setInterests(parsed);
            setIsLoading(false);
            return;
          }
        }

        const response = await api.get("/interests");
        const interestsData =
          response.data.data || response.data.interests || response.data || [];

        if (interestsData.length > 0) {
          setInterests(interestsData);
          await AsyncStorage.setItem("userInterests", JSON.stringify(interestsData));
        } else {
          setInterests(FALLBACK_CATEGORIES);
        }
      } catch (error) {
        console.error("Error loading interests:", error);
        setInterests(FALLBACK_CATEGORIES);
      } finally {
        setIsLoading(false);
      }
    };

    loadInterests();
  }, []);

  return (
    <Sheet context={CategorySheetContext} snapPoints={[0.000001, 700]}>
      <View className="w-10 bg-[#808080a3] h-1 rounded-xl absolute top-2 left-1/2 transform -translate-x-1/2" />
      <View className="w-full h-16 flex items-center justify-end">
        <Text className="text-textPrimary font-MonBold text-xl">
          Set Category
        </Text>
      </View>
      <Divider gap={10} value={370} />
      <BottomSheetScrollView
        className="w-full px-6"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {isLoading ? (
          <Preloader />
        ) : (
          interests.map((item: any) => (
            <Pressable
              key={item.id}
              onPress={() => setCategory(item.name)}
              className="flex flex-row items-center justify-between py-3"
            >
              <Text
                className={`${category === item.name ? "text-textPrimary font-MonBold" : "text-textSecondary font-MonMedium"} text-base`}
              >
                {item.name}
              </Text>
              {category === item.name && (
                <Image source={icons.selected} className="w-4 h-4" />
              )}
            </Pressable>
          ))
        )}
      </BottomSheetScrollView>
      <Pressable
        className="h-14 bg-primary mb-4 rounded-2xl flex items-center justify-center"
        onPress={() => categorySheetRef.current?.collapse()}
      >
        <Text className="text-textPrimary font-MonBold text-lg">Apply</Text>
      </Pressable>
    </Sheet>
  );
};

export default SetCategory;
