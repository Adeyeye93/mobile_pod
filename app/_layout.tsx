/* eslint-disable react-hooks/exhaustive-deps */
import Comments from "@/components/modals/Comments";
import InviteSheet from "@/components/modals/Invites";
import LivePrivacy from "@/components/modals/LivePrivacy";
import MiniPlayer from "@/components/modals/MiniPlayer";
import Options from "@/components/modals/Options";
import PlayerBottomSheet, { PlayerProvider } from "@/components/modals/player";
import RssLink, { RssLinkProvider } from "@/components/modals/RSSLink";
import SetCategory from "@/components/modals/SetCategory";
import SortFilterE, { SortFilterProvider } from "@/components/modals/Sort";
import { AudioPlayerProvider } from "@/context/AudioPlayerContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import {
  CategorySheetProvider,
  CommentsSheetProvider,
  InviteSheetProvider,
  LivePrivacySheetProvider,
  OptionsSheetProvider,
  SearchSheetProvider,
  StreamTimeSheetProvider,
  LiveRecorderSheetProvider
} from "@/context/CreateSheetContext";
import {
  CreatorModeProvider,
  useCreatorMode,
} from "@/context/CreatorModeContext";
import { FlashToastProvider } from "@/context/FlashMessageContext";
import { GuestInviteProvider } from "@/context/GuessInviteContext";
import { InterestProvider, useInterest } from "@/context/InterestContext";
import { MiniPlayerProvider } from "@/context/MiniPlayerContext";
import {
  CreatorWelcomeModalProvider,
  PlayListContentProvider,
  PlayListModalProvider,
} from "@/context/ModalIntances";
import ScheduleTime from "@/context/stream/ScheduleTime";
import { LiveStreamProvider } from "@/context/stream/StreamContext";
import { StreamProvider } from "@/context/stream/StreamSetUp";
import { UIProvider, useUI } from "@/context/UIContext";
import { getInitialRoute, getNavigationState } from "@/libs/navigationLogic";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Slot, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./globals.css";
import CreatorWelcome from "./home/CreatorWelcome";
import LiveRecorder from "@/components/modals/LiveRecorder";
import { LiveNotificationProvider } from "@/context/LiveNotificationContext";

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { isBootstrapping, user, isAuthenticated } = useAuth();
  const { isRSSLinkOpen } = useUI();
  const { isCreatorMode } = useCreatorMode();

  const {
    hasInterest,
    loadUserInterests,
    isInterestHydrated,
    setHasInterest,
    setUserInterests,
  } = useInterest();
  const router = useRouter();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: false,
    }),
  });

  const [fontsLoaded, fontError] = useFonts({
    bold: require("@/assets/fonts/Montserrat-Bold.ttf"),
    medium: require("@/assets/fonts/Montserrat-Medium.ttf"),
    regular: require("@/assets/fonts/Montserrat-Regular.ttf"),
    thin: require("@/assets/fonts/Montserrat-Thin.ttf"),
  });

  // Load user interests when authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isBootstrapping && isInterestHydrated) {
      const loadInterests = async () => {
        try {
          const cached = await AsyncStorage.getItem("userInterests");
          if (cached) {
            setUserInterests(JSON.parse(cached));
            setHasInterest();
            return;
          }
          loadUserInterests(user.id);
        } catch (error) {
          setUserInterests([]);
        } finally {
        }
      };

      loadInterests();
    }
  }, [isAuthenticated, user, isBootstrapping, isInterestHydrated]);

  // Determine navigation state
  const navState = getNavigationState({
    isBootstrapping,
    isAuthenticated,
    isInterestHydrated,
    hasInterest,
    fontsLoaded: fontsLoaded ?? false,
    OnCreator: isCreatorMode,
  });

  // Handle navigation based on state
  useEffect(() => {
    if (navState !== "splash") {
      const targetRoute = getInitialRoute(navState);
      router.replace(targetRoute as any);

      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 3000);
    }
  }, [navState]);

  // Show nothing while loading
  if (navState === "splash") {
    return null;
  }

  // Render main app with modals
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
      <CreatorWelcome />
      <SetCategory />
      <ScheduleTime />
      <InviteSheet />
      <LivePrivacy />
      <LiveRecorder />

    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StreamProvider>
        <FlashToastProvider>
          <AuthProvider>
            <InterestProvider>
              <AudioPlayerProvider>
                <CreatorModeProvider>
                  <CreatorWelcomeModalProvider>
                    <GuestInviteProvider>
                      <PlayerProvider>
                        <CommentsSheetProvider>
                          <PlayListModalProvider>
                            <PlayListContentProvider>
                              <OptionsSheetProvider>
                                <SearchSheetProvider>
                                  <LivePrivacySheetProvider>
                                    <SortFilterProvider>
                                      <CategorySheetProvider>
                                        <StreamTimeSheetProvider>
                                          <InviteSheetProvider>
                                            <LiveStreamProvider>
                                              <LiveRecorderSheetProvider>
                                                <LiveNotificationProvider>
                                                  <UIProvider>
                                                    <RssLinkProvider>
                                                      <MiniPlayerProvider>
                                                        <RootLayoutContent />
                                                      </MiniPlayerProvider>
                                                    </RssLinkProvider>
                                                  </UIProvider>
                                                </LiveNotificationProvider>
                                              </LiveRecorderSheetProvider>
                                            </LiveStreamProvider>
                                          </InviteSheetProvider>
                                        </StreamTimeSheetProvider>
                                      </CategorySheetProvider>
                                    </SortFilterProvider>
                                  </LivePrivacySheetProvider>
                                </SearchSheetProvider>
                              </OptionsSheetProvider>
                            </PlayListContentProvider>
                          </PlayListModalProvider>
                        </CommentsSheetProvider>
                      </PlayerProvider>
                    </GuestInviteProvider>
                  </CreatorWelcomeModalProvider>
                </CreatorModeProvider>
              </AudioPlayerProvider>
            </InterestProvider>
          </AuthProvider>
        </FlashToastProvider>
      </StreamProvider>
    </GestureHandlerRootView>
  );
}
