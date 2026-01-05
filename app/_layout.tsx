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
import { FlashToastProvider } from "@/context/FlashMessageContext";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();


function RootLayoutContent() {
  const { isBootstrapping } = useAuth();
  const { isSheetOpen, isRSSLinkOpen } = useUI();

  const [fontsLoaded, fontError] = useFonts({
    bold: require("@/assets/fonts/Montserrat-Bold.ttf"),
    medium: require("@/assets/fonts/Montserrat-Medium.ttf"),
    regular: require("@/assets/fonts/Montserrat-Regular.ttf"),
    thin: require("@/assets/fonts/Montserrat-Thin.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;
  if (isBootstrapping) return null;

  return (
    <>
      {/* ROUTES */}
      <Slot />

      {/* GLOBAL UI LAYER */}
      <MiniPlayerProvider>
        {!isSheetOpen && !isRSSLinkOpen && <MiniPlayer />}
      </MiniPlayerProvider>
      {!isRSSLinkOpen && <RssLink />}
      <SortFilterE />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlashToastProvider>
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
      </FlashToastProvider>
    </GestureHandlerRootView>
  );
}