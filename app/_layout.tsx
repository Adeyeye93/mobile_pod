import MiniPlayer from "@/components/modals/MiniPlayer";
import RssLink, { RssLinkProvider } from "@/components/modals/RSSLink";
import SortFilterE, { SortFilterProvider } from "@/components/modals/Sort";
import { UIProvider, useUI } from "@/context/UIContext";
import { Slot, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./globals.css";
import { MiniPlayerProvider } from "@/context/MiniPlayerContext";
import { AudioPlayerProvider } from "@/context/AudioPlayerContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { FlashToastProvider } from "@/context/FlashMessageContext";
import { useInterest, InterestProvider } from "@/context/InterestContext";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { isBootstrapping, user, isAuthenticated } = useAuth();
  const { isSheetOpen, isRSSLinkOpen } = useUI();
  const { hasInterest, loadUserInterests, isInterestHydrated } = useInterest();
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    bold: require("@/assets/fonts/Montserrat-Bold.ttf"),
    medium: require("@/assets/fonts/Montserrat-Medium.ttf"),
    regular: require("@/assets/fonts/Montserrat-Regular.ttf"),
    thin: require("@/assets/fonts/Montserrat-Thin.ttf"),
  });

  // Handle interest redirect after auth
  useEffect(() => {
    if (isAuthenticated && user && !isBootstrapping) {
      loadUserInterests(user.id);
    }
  }, [isAuthenticated, user, isBootstrapping]);


  // Redirect if no interests selected
  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      isInterestHydrated && // 🔑 KEY FIX
      !hasInterest &&
      !isBootstrapping &&
      fontsLoaded
    ) {
      router.replace("/(auth)/interests");
    }
  }, [
    isAuthenticated,
    hasInterest,
    isInterestHydrated,
    user,
    isBootstrapping,
    fontsLoaded,
  ]);


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
          <InterestProvider>
            <AudioPlayerProvider>
              <SortFilterProvider>
                <UIProvider>
                  <RssLinkProvider>
                    <RootLayoutContent />
                  </RssLinkProvider>
                </UIProvider>
              </SortFilterProvider>
            </AudioPlayerProvider>
          </InterestProvider>
        </AuthProvider>
      </FlashToastProvider>
    </GestureHandlerRootView>
  );
}
