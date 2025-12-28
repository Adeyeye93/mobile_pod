import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRef, useState, createContext, useContext, useCallback } from "react";import { icons } from "@/constants/icons";
import Divider from "../divider";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useUI } from "@/context/UIContext";

// Create context for the ref
const SortFilterContext = createContext<any>(null);

export function useSortFilter() {
  return useContext(SortFilterContext);
}

export function SortFilterProvider({ children }: any) {
  const ref = useRef<BottomSheet>(null);

  return (
    <SortFilterContext.Provider value={{ ref }}>
      {children}
    </SortFilterContext.Provider>
  );
}


export default function SortFilterE() {
  const { ref: bottomSheetRef } = useSortFilter();
  const [sortBy, setSortBy] = useState("newest");
  const [hideCompleted, setHideCompleted] = useState(false);
  const { setIsSheetOpen } = useUI();

  const handleAnimate = (fromIndex: number, toIndex: number) => {
    // sheet is starting to open
    if (toIndex > 0) {
      setIsSheetOpen(true);
    }

    // sheet is fully closing
    if (toIndex === 0) {
      setIsSheetOpen(false);
    }
  };



  const handleSheetChanges = useCallback((index: number) => {
    console.log("Sheet index:", index);
    setIsSheetOpen(index > 0);
  }, []);

  const handleReset = () => {
    setSortBy("newest");
    setHideCompleted(false);
  };

  const handleApply = () => {
    console.log("Applied filters:", { sortBy, hideCompleted });
    bottomSheetRef.current?.close();
  };





  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={[1, 500]}
        onChange={handleSheetChanges}
        onAnimate={handleAnimate}
        backgroundStyle={{
          backgroundColor: "#1f222b",
          borderTopLeftRadius: 35,
          borderTopRightRadius: 35,
        }}
        handleIndicatorStyle={{
          backgroundColor: "#4f8cff",
          width: 40,
          height: 4,
          borderRadius: 2,
        }}
      >
        <BottomSheetView className="bg-[#1f222b] flex-1 px-6 h-full">
          {/* Header */}
          <Text className="text-textPrimary text-2xl font-bold text-center font-MonBold mt-10">
            Sort & Filter
          </Text>
          <Divider gap={20} value={370} />

          {/* Sort Section */}
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-10 font-MonBold">
              Sort
            </Text>

            <TouchableOpacity
              onPress={() => setSortBy("newest")}
              className="flex flex-row items-center gap-3 mb-4"
            >
              <View className="w-6 h-6 rounded flex items-center justify-center">
                {sortBy === "newest" && (
                  <Image source={icons.selected} className="w-4 h-4" />
                )}
              </View>
              <Text className="text-white text-base font-MonRegular">
                Newest First
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSortBy("oldest")}
              className="flex flex-row items-center gap-3"
            >
              <View className="w-6 h-6 rounded flex items-center justify-center">
                {sortBy === "oldest" && (
                  <Image source={icons.selected} className="w-4 h-4" />
                )}
              </View>
              <Text className="text-white text-base font-MonRegular">
                Oldest First
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filter Section */}
          <View>
            <Text className="text-white text-lg font-semibold mb-4 font-MonBold">
              Filter
            </Text>

            <TouchableOpacity
              onPress={() => setHideCompleted(!hideCompleted)}
              className="flex flex-row items-center gap-3"
            >
              <View className="w-6 h-6 rounded flex items-center justify-center">
                {hideCompleted && (
                  <Image source={icons.hide} className="w-6 h-6" />
                )}
                {!hideCompleted && (
                  <Image source={icons.reveal} className="w-6 h-6" />
                )}
              </View>
              <Text className="text-white text-base font-MonRegular">
                {hideCompleted
                  ? "Hide Completed Episodes"
                  : "Show Completed Episodes"}
              </Text>
            </TouchableOpacity>
          </View>
          <Divider gap={20} value={370} />

          {/* Buttons */}
          <View className="flex-row gap-4 mt-4">
            <TouchableOpacity
              onPress={handleReset}
              className="flex-1 bg-gray-700 rounded-full py-3"
            >
              <Text className="text-white text-center font-MonBold">Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApply}
              className="flex-1 bg-primary rounded-full py-3"
            >
              <Text className="text-white text-center font-MonBold">Apply</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
