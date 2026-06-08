import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CreatorModeContextType {
  isCreatorMode: boolean;
  toggleCreatorMode: () => void;
  setCreatorMode: (mode: boolean) => void;
  am_a_creator: boolean;
  setAm_a_creator: (mode: boolean) => void;
}

const CreatorModeContext = createContext<CreatorModeContextType | undefined>(
  undefined,
);

export function CreatorModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCreatorMode, setIsCreatorMode] = useState(false);
  const [am_a_creator, setAm_a_creator] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("creatorMode");
        if (stored !== null) {
          setIsCreatorMode(JSON.parse(stored));
        }
      } catch (error) {
        console.log("Error reading creator mode preference:", error);
      }
    })();
  }, []);

  const toggleCreatorMode = async () => {
    const newMode = !isCreatorMode;
    setIsCreatorMode(newMode);
    try {
      await AsyncStorage.setItem("creatorMode", JSON.stringify(newMode));
    } catch (error) {
      console.log("Error saving creator mode preference:", error);
    }
  };


  const setCreatorMode = async (mode: boolean) => {
    setIsCreatorMode(mode);
    try {
      await AsyncStorage.setItem("creatorMode", JSON.stringify(mode));
    } catch (error) {
      console.log("Error saving creator mode preference:", error);
    }
  };

  return (
    <CreatorModeContext.Provider
      value={{
        isCreatorMode,
        am_a_creator,
        toggleCreatorMode,
        setCreatorMode,
        setAm_a_creator
      }}
    >
      {children}
    </CreatorModeContext.Provider>
  );
}

export function useCreatorMode(): CreatorModeContextType {
  const context = useContext(CreatorModeContext);
  if (!context) {
    throw new Error("useCreatorMode must be used within CreatorModeProvider");
  }
  return context;
}
