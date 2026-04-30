import { createContext, useContext, useMemo, useState } from "react";


interface StreamContextValue {
  title: string;
  isCreatorMode: boolean;
  activeStream: any; // replace with actual stream type
  setTitle: (value: string) => void;
  setIsCreatorMode: (value: boolean) => void;
  setActiveStream: (value: any) => void; // replace with actual stream type
}

const LiveStreamContext = createContext<StreamContextValue | undefined>(undefined);

export const useLiveStream = () => {
  const context = useContext(LiveStreamContext);
  if (!context) {
    throw new Error("useLiveStream must be used within a LiveStreamProvider");
  }
  return context;
};

export const LiveStreamProvider = ({ children }: { children: React.ReactNode }) => {
  const [title, setTitle] = useState("");
  const [isCreatorMode, setIsCreatorMode] = useState(false);
  const [activeStream, setActiveStream] = useState(null);

  const value = useMemo(() => ({
    title,
    isCreatorMode,
    activeStream,
    setTitle,
    setIsCreatorMode,
    setActiveStream
  }), [title, isCreatorMode, activeStream]);

  return (
    <LiveStreamContext.Provider value={value}>
      {children}
    </LiveStreamContext.Provider>
  );
};
