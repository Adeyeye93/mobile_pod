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
          JSON.stringify(interestsData),
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
