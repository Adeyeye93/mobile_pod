import { Stack } from "expo-router";

export default function _layout() {
  return (
    <Stack>
      <Stack.Screen name="Listener" options={{ headerShown: false }} />
    </Stack>
  );
}