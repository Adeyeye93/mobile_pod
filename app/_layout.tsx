import MiniPlayer from "@/components/modals/MiniPlayer";
import RssLink, { RssLinkProvider } from "@/components/modals/RSSLink";
import SortFilterE, { SortFilterProvider } from "@/components/modals/Sort";
import { UIProvider, useUI } from "@/context/UIContext";
import { Stack } from "expo-router";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./globals.css";

function RootLayoutContent() {
  const { isSheetOpen, isRSSLinkOpen } = useUI();

  return (
    <>
      <View className="flex-1">
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
        </Stack>
        {!isSheetOpen && !isRSSLinkOpen && <MiniPlayer />}

        {!isRSSLinkOpen && <RssLink />}

        <SortFilterE />
      </View>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SortFilterProvider>
        <UIProvider>
          <RssLinkProvider>
            <RootLayoutContent />
          </RssLinkProvider>
        </UIProvider>
      </SortFilterProvider>
    </GestureHandlerRootView>
  );
}
