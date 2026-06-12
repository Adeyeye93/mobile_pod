import { Stack } from "expo-router";

export default function _layout() {
  return (
    <Stack>
      <Stack.Screen name="Schedule" options={{ headerShown: false }} />
      <Stack.Screen name="upload" options={{ headerShown: false }} />
      <Stack.Screen name="channel-settings" options={{ headerShown: false }} />
      <Stack.Screen name="invites" options={{ headerShown: false }} />
    </Stack>
  );
}
