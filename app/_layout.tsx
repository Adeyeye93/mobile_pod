import MiniPlayer from "@/components/modals/MiniPlayer";
import RssLink, { RssLinkProvider } from "@/components/modals/RSSLink";
import SortFilterE, { SortFilterProvider } from "@/components/modals/Sort";
import { UIProvider, useUI } from "@/context/UIContext";
import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./globals.css";
import { MiniPlayerProvider } from "@/context/MiniPlayerContext";
import { AudioPlayerProvider } from "@/context/AudioPlayerContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";


function RootLayoutContent() {
  const { isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return null; // splash later
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AudioPlayerProvider>
          <SortFilterProvider>
            <UIProvider>
              <RssLinkProvider>
                <RootLayoutContent />
              </RssLinkProvider>
            </UIProvider>
          </SortFilterProvider>
        </AudioPlayerProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}