import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useInterest } from "@/context/InterestContext";

export default function _layout() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const { hasInterest } = useInterest();

  // Hold rendering until auth state is known
  if (isBootstrapping) return null;

  if (!isAuthenticated) return <Redirect href="/(auth)/onboarding" />;
  if (!hasInterest) return <Redirect href="/(auth)/interests" />;

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
