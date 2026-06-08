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

const PlayerContext = createContext<any>(null);

export function usePlayer() {
  return useContext(PlayerContext);
}

export function PlayerProvider({ children }: any) {
  const ref = useRef<BottomSheet>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <PlayerContext.Provider value={{ ref, isExpanded, setIsExpanded }}>
      {children}
    </PlayerContext.Provider>
  );
}

export default function PlayerBottomSheet() {
  const { ref: bottomSheetRef, setIsExpanded } = usePlayer();
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const handleAnimate = (fromIndex: number, toIndex: number) => {
    if (toIndex > 0) setScrollEnabled(true);
  };

  const handleChange = (index: number) => {
    setIsExpanded(index > 0);
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={[0.00000000000001, WINDOW_HEIGHT]}
      onAnimate={handleAnimate}
      onChange={handleChange}
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
  );
}
