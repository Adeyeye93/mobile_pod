import { View } from "react-native";
import {
  useRef,
  createContext,
  useContext,
  useState,
} from "react";
import BottomSheet, {
  BottomSheetView,
  WINDOW_HEIGHT,
} from "@gorhom/bottom-sheet";
import Player from "@/components/page/player";

// Create context for the ref
const PlayerContext = createContext<any>(null);

export function usePlayer() {
  return useContext(PlayerContext);
}

export function PlayerProvider({ children }: any) {
  const ref = useRef<BottomSheet>(null);

  return (
    <PlayerContext.Provider value={{ ref }}>{children}</PlayerContext.Provider>
  );
}

export default function PlayerBottomSheet() {
  const { ref: bottomSheetRef } = usePlayer();
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const handleAnimate = (fromIndex: number, toIndex: number) => {
    if (toIndex > 0) {
      setScrollEnabled(true);
    } 
  };

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={[0.1, WINDOW_HEIGHT]}
        onAnimate={handleAnimate}
        enablePanDownToClose={scrollEnabled}
        enableContentPanningGesture={scrollEnabled}
        backgroundStyle={{
          backgroundColor: "transparent",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
        handleComponent={() => null}
      >
        <BottomSheetView className="flex-1 h-full">
          <Player />
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
