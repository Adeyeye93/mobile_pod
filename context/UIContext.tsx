import { createContext, useContext, useState } from "react";

type UIContextType = {
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
  isRSSLinkOpen?: boolean;
  setIsRSSLinkOpen?: (open: boolean) => void;

};

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isRSSLinkOpen, setIsRSSLinkOpen] = useState(false);

  return (
    <UIContext.Provider value={{ isSheetOpen, setIsSheetOpen, isRSSLinkOpen, setIsRSSLinkOpen }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside UIProvider");
  return ctx;
}
