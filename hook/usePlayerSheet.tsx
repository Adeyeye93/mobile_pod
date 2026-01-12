// hooks/usePlayerSheet.ts
import { useRef, createContext, useContext } from "react";
import BottomSheet from "@gorhom/bottom-sheet";

const PlayerContext = createContext<any>(null);

export function usePlayer() {
  return useContext(PlayerContext);
}

export { PlayerContext };
