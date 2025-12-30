import { Stack } from "expo-router";

export default function _layout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="podcast/[episode]" options={{ headerShown: false }} />
      <Stack.Screen
        options={{
          presentation: "modal",
          headerShown: false,
        }}
        name="podcast/player"
      />
    </Stack>
  );
}
