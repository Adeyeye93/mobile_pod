import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "auth_session";

export async function saveAuth(data: StoredAuth) {
  await SecureStore.setItemAsync(KEY, JSON.stringify(data), {
    keychainAccessible:
      Platform.OS === "ios"
        ? SecureStore.AFTER_FIRST_UNLOCK
        : undefined,
  });
}

export async function getAuth(): Promise<StoredAuth | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync(KEY);
}

