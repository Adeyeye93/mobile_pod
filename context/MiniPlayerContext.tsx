import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "expo-router";

export interface MiniPlayerConfig {
  isVisible: boolean;
  position?: "bottom" | "top";
  offset?: number;
}

interface MiniPlayerContextType {
  config: MiniPlayerConfig;
  setMiniPlayerVisible: (visible: boolean) => void;
  setMiniPlayerPosition: (position: "bottom" | "top", offset?: number) => void;
  closeMiniPlayer: () => void;
  getCurrentPageConfig: () => MiniPlayerConfig;
}

const MiniPlayerContext = createContext<MiniPlayerContextType | undefined>(
  undefined
);

// Define MiniPlayer config for each page
const pageConfigs: Record<string, MiniPlayerConfig> = {
  "/": { isVisible: true, position: "bottom", offset: 85 },
  "/discover": { isVisible: true, position: "bottom", offset: 85 },
  "/library": { isVisible: true, position: "bottom", offset: 85 },
  "/profile": { isVisible: true, position: "bottom", offset: 85 },
  "/home/notification": { isVisible: true, position: "bottom", offset: 50 },
  "/home/subscriptions": { isVisible: true, position: "bottom", offset: 50 },
    "/home/author/podcast/player": { isVisible: false, position: "bottom", offset: 0 },
  // Add more pages as needed
};

// Function to match dynamic routes with patterns
const getConfigForRoute = (pathname: string): MiniPlayerConfig => {
  // Check exact match first
  if (pageConfigs[pathname]) {
    return pageConfigs[pathname];
  }

  // Check pattern matches
  if (pathname.startsWith("/home/author/")) {
    return { isVisible: true, position: "bottom", offset: 50 };
  }

  if (pathname.startsWith("/home/")) {
    return { isVisible: true, position: "bottom", offset: 50 };
  }


  if (pathname.startsWith("/home/podcast/")) {
    return { isVisible: true, position: "bottom", offset: 50 };
  }

  // Default fallback
  return { isVisible: false, position: "bottom", offset: 0 };
};

export const MiniPlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const [config, setConfig] = useState<MiniPlayerConfig>({
    isVisible: false,
    position: "bottom",
    offset: 0,
  });

  // Update config when route changes
  useEffect(() => {
    const newConfig = getConfigForRoute(pathname);
    setConfig(newConfig);
  }, [pathname]);

  const setMiniPlayerVisible = (visible: boolean) => {
    setConfig((prev) => ({ ...prev, isVisible: visible }));
  };

  const setMiniPlayerPosition = (
    position: "bottom" | "top",
    offset: number = 0
  ) => {
    setConfig((prev) => ({ ...prev, position, offset }));
  };

  const closeMiniPlayer = () => {
    setConfig((prev) => ({ ...prev, isVisible: false }));
  };

  const getCurrentPageConfig = () => {
    return getConfigForRoute(pathname);
  };

  return (
    <MiniPlayerContext.Provider
      value={{
        config,
        setMiniPlayerVisible,
        setMiniPlayerPosition,
        closeMiniPlayer,
        getCurrentPageConfig,
      }}
    >
      {children}
    </MiniPlayerContext.Provider>
  );
};

export const useMiniPlayer = () => {
  const context = useContext(MiniPlayerContext);
  if (!context) {
    throw new Error("useMiniPlayer must be used within MiniPlayerProvider");
  }
  return context;
};
