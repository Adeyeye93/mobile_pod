import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import React from "react";
import {
  SearchSheetContext,
  Sheet,
  useSearchSheet,
} from "@/context/CreateSheetContext";
import { WINDOW_HEIGHT } from "@gorhom/bottom-sheet";
import { icons } from "@/constants/icons";
import Divider from "../divider";
import Recent from "../search/Recent";

const Search = () => {
  const { ref: sheetRef } = useSearchSheet();

  return (
    <Sheet context={SearchSheetContext} snapPoints={[0.1, WINDOW_HEIGHT]}>
      <View className="h-full mt-24 px-6">
        <View className="w-full h-fit flex-row items-center justify-start border border-[#1f222b] bg-[#1f222b] rounded-3xl pl-5">
          <Image className="w-6 h-6" source={icons.search} tintColor="gray" />
          <TextInput
            className=" h-20 flex-1 pl-5 font-MonMedium text-textSecondary text-xl"
            placeholder="Search"
            placeholderTextColor="gray"
          />
        </View>
        <View className="w-full flex-row items-center justify-between h-14">
          <Text className="text-xl text-textSecondary font-MonBold">
            Recent Searchs
          </Text>
          <Text className="text-primary font-MonMedium text-lg">Clear all</Text>
        </View>
        <Divider gap={10} value={370} />
        <ScrollView
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: "column",
            gap: 10,
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <Recent />
          <Recent />
          <Recent />
          <Recent />
          <Recent />
          <Recent />
          <Recent />
          <Recent />
          
        </ScrollView>
      </View>
    </Sheet>
  );
};

export default Search;
