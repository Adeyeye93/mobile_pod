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
import PlayerBottomSheet, { PlayerProvider } from "@/components/modals/player";
import { View, Text } from "react-native";
import { CommentsSheetProvider, OptionsSheetProvider } from "@/context/CreateSheetContext";
import Comments from "@/components/modals/Comments";
import Options from "@/components/modals/Options";


SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { isBootstrapping, user, isAuthenticated } = useAuth();
  const { isRSSLinkOpen } = useUI();
  const { hasInterest, loadUserInterests, isInterestHydrated } = useInterest();
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    bold: require("@/assets/fonts/Montserrat-Bold.ttf"),
    medium: require("@/assets/fonts/Montserrat-Medium.ttf"),
    regular: require("@/assets/fonts/Montserrat-Regular.ttf"),
    thin: require("@/assets/fonts/Montserrat-Thin.ttf"),
  });

  useEffect(() => {
    if (isAuthenticated && user && !isBootstrapping) {
      loadUserInterests(user.id);
    }
  }, [isAuthenticated, user, isBootstrapping]);

  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      isInterestHydrated &&
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
    <View className="flex-1">
      {/* Main content */}
      <View className="flex-1 relative z-0">
        <MiniPlayer />
        <Slot />
      </View>

      {/* Modals rendered last so they're always on top */}
      {!isRSSLinkOpen && <RssLink />}
      <SortFilterE />

      {/* BottomSheet MUST be rendered last to always be on top */}
      <PlayerBottomSheet />
      <Comments />
      <Options />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlashToastProvider>
        <AuthProvider>
          <InterestProvider>
            <AudioPlayerProvider>
              <PlayerProvider>
                <CommentsSheetProvider>
                  <OptionsSheetProvider>
                    <SortFilterProvider>
                      <UIProvider>
                        <RssLinkProvider>
                          <MiniPlayerProvider>
                            <RootLayoutContent />
                          </MiniPlayerProvider>
                        </RssLinkProvider>
                      </UIProvider>
                    </SortFilterProvider>
                  </OptionsSheetProvider>
                </CommentsSheetProvider>
              </PlayerProvider>
            </AudioPlayerProvider>
          </InterestProvider>
        </AuthProvider>
      </FlashToastProvider>
    </GestureHandlerRootView>
  );
}
