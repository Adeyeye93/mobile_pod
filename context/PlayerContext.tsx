import { createContext, useState, Dispatch, SetStateAction } from 'react';

export const PlayerContext = createContext({
  isPlaying: false,
  setIsPlaying: (() => {}) as Dispatch<SetStateAction<boolean>>,
  isCompleted: false,
  setIsCompleted: (() => {}) as Dispatch<SetStateAction<boolean>>,
});

export function PlayerProvider({ children }: any) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(true);

  return (
    <PlayerContext.Provider value={{ isPlaying, setIsPlaying, isCompleted, setIsCompleted }}>
      {children}
    </PlayerContext.Provider>
  );
}