import { useAuth } from "@/context/AuthContext";
import { useInterest } from "@/context/InterestContext";
import { Redirect, Stack, useSegments } from "expo-router";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();
  const { hasInterest } = useInterest();
  const segments = useSegments();

  // Fully onboarded users have no business on auth screens
  if (isAuthenticated && hasInterest) {
    return <Redirect href="/(tabs)" />;
  }

  // Authenticated but no interests yet — guide them to the interests screen
  // The segment check prevents an infinite redirect loop when already on that screen
  if (isAuthenticated && !hasInterest && !segments.includes("interests" as any)) {
    return <Redirect href="/(auth)/interests" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
