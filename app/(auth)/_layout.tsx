import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function AuthLayout() {
 const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return null;
  }

  if (isAuthenticated && !isBootstrapping) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
