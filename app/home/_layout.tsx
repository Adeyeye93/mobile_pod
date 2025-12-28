import { Stack } from "expo-router";

export default function _layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="notification" options={{ headerShown: false }} />
      <Stack.Screen name="subscriptions" options={{ headerShown: false }} />
      <Stack.Screen name="[title]" options={{ headerShown: false }} />
      <Stack.Screen name="author" options={{ headerShown: false }} />
    </Stack>
  );
}
