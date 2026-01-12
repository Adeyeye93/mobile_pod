import MiniPlayer from "@/components/modals/MiniPlayer";
import RssLink, { RssLinkProvider } from "@/components/modals/RSSLink";
import SortFilterE, { SortFilterProvider } from "@/components/modals/Sort";
import { UIProvider, useUI } from "@/context/UIContext";
import { Slot, useRouter, Redirect } from "expo-router";
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
import { View } from "react-native";
import { CommentsSheetProvider, OptionsSheetProvider, SearchSheetProvider } from "@/context/CreateSheetContext";
import Comments from "@/components/modals/Comments";
import Options from "@/components/modals/Options";
import Search from "@/components/modals/Search";


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

    console.log("isAuthenticated", isAuthenticated);
    console.log("user", user);
    console.log("isBootstrapping", isBootstrapping);
    console.log("hasInterest", hasInterest);
    console.log("fontsLoaded", fontsLoaded);
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

  if (isBootstrapping) {
    return null;
  }

  if (!isAuthenticated && !isBootstrapping) {
    return <Redirect href="/(auth)/sign-in" />;
  }


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
      <Search />
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
                    <SearchSheetProvider>
                      <SortFilterProvider>
                        <UIProvider>
                          <RssLinkProvider>
                            <MiniPlayerProvider>
                              <RootLayoutContent />
                            </MiniPlayerProvider>
                          </RssLinkProvider>
                        </UIProvider>
                      </SortFilterProvider>
                    </SearchSheetProvider>
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
