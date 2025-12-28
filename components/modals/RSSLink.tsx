import { View, Text, TouchableOpacity, TextInput } from "react-native";
import {
  useRef,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useUI } from "@/context/UIContext";

// Create context for the ref
const RssLinkContext = createContext<any>(null);

export function useRssLink() {
  return useContext(RssLinkContext);
}

export function RssLinkProvider({ children }: any) {
  const ref = useRef<BottomSheet>(null);

  return (
    <RssLinkContext.Provider value={{ ref }}>
      {children}
    </RssLinkContext.Provider>
  );
}

export default function RssLink() {
  const { ref: bottomSheetRef } = useRssLink();
  const [hideCompleted, setHideCompleted] = useState(false);
  const [url, setUrl] = useState("");
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
    setHideCompleted(false);
  };

  const handleApply = () => {
    console.log("Applied filters:", { hideCompleted });
    bottomSheetRef.current?.close();
  };

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={[1, 300]}
        onChange={handleSheetChanges}
        onAnimate={handleAnimate}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
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
            {/* Title */}
            <Text className="text-textPrimary text-center text-2xl font-bold mb-2 font-MonBold">
              Subscribe to a Podcast
            </Text>
            <Text className="text-textSecondary text-center mb-6 font-MonRegular">
              by RSS Feed
            </Text>

            {/* Input */}
            <TextInput
              placeholder="https://exampleweb.domain/podcast.xml"
              placeholderTextColor="#666"
              value={url}
              onChangeText={setUrl}
              className="bg-[#2a2a3e] border-2 border-primary rounded-2xl px-4 py-3 text-white mb-6 font-MonRegular"
            />

            {/* Buttons */}
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => handleReset()}
                className="flex-1 bg-gray-700 rounded-full py-3"
              >
                <Text className="text-white text-center font-MonBold">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleReset}
                className="flex-1 bg-primary rounded-full py-3"
              >
                <Text className="text-white text-center font-MonBold">
                  Subscribe
                </Text>
              </TouchableOpacity>
            </View>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
