import Comments from "@/components/modals/Comments";
import InviteSheet from "@/components/modals/Invites";
import LivePrivacy from "@/components/modals/LivePrivacy";
import LiveRecorder from "@/components/modals/LiveRecorder";
import LogoutSheet from "@/components/modals/LogoutSheet";
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
  LiveRecorderSheetProvider,
  LogoutSheetProvider,
  OptionsSheetProvider,
  SearchSheetProvider,
  StreamTimeSheetProvider,
} from "@/context/CreateSheetContext";
import { CreatorModeProvider } from "@/context/CreatorModeContext";
import { FlashToastProvider } from "@/context/FlashMessageContext";
import { GuestInviteProvider } from "@/context/GuessInviteContext";
import { InterestProvider, useInterest } from "@/context/InterestContext";
import { LiveNotificationProvider } from "@/context/LiveNotificationContext";
import { MiniPlayerProvider } from "@/context/MiniPlayerContext";
import {
  CreatorWelcomeModalProvider,
  PlayListContentProvider,
  PlayListModalProvider,
} from "@/context/ModalIntances";
import ScheduleTime from "@/context/stream/ScheduleTime";
import { StreamProvider } from "@/context/stream/StreamSetUp";
import { UIProvider, useUI } from "@/context/UIContext";
import CreatorWelcome from "@/app/home/CreatorWelcome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./globals.css";

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { isBootstrapping, user } = useAuth();
  const { isInterestHydrated, setUserInterests, setHasInterest, loadUserInterests } = useInterest();
  const { isRSSLinkOpen } = useUI();

  const [fontsLoaded] = useFonts({
    bold: require("@/assets/fonts/Montserrat-Bold.ttf"),
    medium: require("@/assets/fonts/Montserrat-Medium.ttf"),
    regular: require("@/assets/fonts/Montserrat-Regular.ttf"),
    thin: require("@/assets/fonts/Montserrat-Thin.ttf"),
  });

  const isReady = !isBootstrapping && !!fontsLoaded && isInterestHydrated;

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync();
  }, [isReady]);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: false,
      }),
    });
  }, []);

  // Load cached interest data for display once the user is known
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const cached = await AsyncStorage.getItem("userInterests");
        if (cached) {
          setUserInterests(JSON.parse(cached));
          setHasInterest();
          return;
        }
        loadUserInterests(user.id);
      } catch {
        setUserInterests([]);
      }
    };
    load();
  }, [user?.id]);

  if (!isReady) return null;

  return (
    <View style={{ flex: 1 }}>
      <MiniPlayer />
      <Slot />

      {/* Global modals — rendered above all screens */}
      {!isRSSLinkOpen && <RssLink />}
      <SortFilterE />
      <PlayerBottomSheet />
      <Comments />
      <Options />
      <CreatorWelcome />
      <SetCategory />
      <ScheduleTime />
      <InviteSheet />
      <LivePrivacy />
      <LiveRecorder />
      <LogoutSheet />
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
                                            <LiveRecorderSheetProvider>
                                              <LogoutSheetProvider>
                                                <LiveNotificationProvider>
                                                  <UIProvider>
                                                    <RssLinkProvider>
                                                      <MiniPlayerProvider>
                                                        <RootLayoutContent />
                                                      </MiniPlayerProvider>
                                                    </RssLinkProvider>
                                                  </UIProvider>
                                                </LiveNotificationProvider>
                                              </LogoutSheetProvider>
                                            </LiveRecorderSheetProvider>
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
