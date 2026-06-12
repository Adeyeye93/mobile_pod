import { createContext, useContext, useRef, useState } from "react";
import type BottomSheet from "@gorhom/bottom-sheet";

interface PlayerContextValue {
  ref: React.RefObject<BottomSheet>;
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<BottomSheet>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <PlayerContext.Provider value={{ ref, isExpanded, setIsExpanded }}>
      {children}
    </PlayerContext.Provider>
  );
}
