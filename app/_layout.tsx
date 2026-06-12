import Comments from "@/components/modals/Comments";
import InviteSheet from "@/components/modals/Invites";
import LivePrivacy from "@/components/modals/LivePrivacy";
import LiveRecorder from "@/components/modals/LiveRecorder";
import LogoutSheet from "@/components/modals/LogoutSheet";
import MiniPlayer from "@/components/modals/MiniPlayer";
import Options from "@/components/modals/Options";
import PlayerBottomSheet from "@/components/modals/player";
import { PlayerProvider } from "@/context/PlayerContext";
import RssLink, { RssLinkProvider } from "@/components/modals/RSSLink";
import SetCategory from "@/components/modals/SetCategory";
import SortFilterE, { SortFilterProvider } from "@/components/modals/Sort";
import ListModal from "@/components/library/tabs/ListModal";
import { AudioPlayerProvider } from "@/context/AudioPlayerContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { FollowProvider } from "@/context/FollowContext";
import { DownloadProvider } from "@/context/DownloadContext";
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
import { NotificationsProvider } from "@/context/NotificationsContext";
import { registerPushToken } from "@/libs/pushNotifications";
import CreatorWelcome from "@/app/home/CreatorWelcome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { Slot, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./globals.css";

// Parse podmobile:// → /home/author/podcast/abc123
function parseAppUrl(url: string): string | null {
  try {
    const { scheme, path } = Linking.parse(url);
    if (scheme !== "podmobile" || !path) return null;
    return `/${path}`;
  } catch {
    return null;
  }
}

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { isBootstrapping, isAuthenticated, user } = useAuth();
  const { isInterestHydrated, setUserInterests, setHasInterest, loadUserInterests } = useInterest();
  const router = useRouter();
  const pendingPath = useRef<string | null>(null);
  const initialChecked = useRef(false);
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

  // Register push token whenever user authenticates
  useEffect(() => {
    if (!user) return;
    registerPushToken();
  }, [user?.id]);

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

  // ── Deep link handling ───────────────────────────────────────────────────────

  // Check the URL that launched the app (cold start from a link)
  useEffect(() => {
    if (isBootstrapping || initialChecked.current) return;
    initialChecked.current = true;
    Linking.getInitialURL().then((url) => {
      if (!url) return;
      const path = parseAppUrl(url);
      if (!path) return;
      if (!isAuthenticated) {
        // Save for after login — home/_layout will redirect to onboarding
        pendingPath.current = path;
      }
      // If already authenticated, Expo Router already navigated to the URL
    });
  }, [isBootstrapping, isAuthenticated]);

  // Handle URLs received while the app is already running
  useEffect(() => {
    const sub = Linking.addEventListener("url", ({ url }) => {
      const path = parseAppUrl(url);
      if (!path) return;
      if (isAuthenticated) {
        router.push(path as any);
      } else {
        pendingPath.current = path;
      }
    });
    return () => sub.remove();
  }, [isAuthenticated, router]);

  // After login, navigate to any saved deep link
  useEffect(() => {
    if (isBootstrapping || !isAuthenticated || !pendingPath.current) return;
    const path = pendingPath.current;
    pendingPath.current = null;
    router.push(path as any);
  }, [isBootstrapping, isAuthenticated, router]);

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
      <ListModal />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StreamProvider>
        <FlashToastProvider>
          <AuthProvider>
            <DownloadProvider>
            <FollowProvider>
            <NotificationsProvider>
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
            </NotificationsProvider>
            </FollowProvider>
            </DownloadProvider>
          </AuthProvider>
        </FlashToastProvider>
      </StreamProvider>
    </GestureHandlerRootView>
  );
}
