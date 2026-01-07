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

export async function updateAuth(updates: Partial<StoredAuth>) {
  try {
    const current = await getAuth();
    if (!current) {
      throw new Error("No auth session found");
    }
    
    const updated = {
      ...current,
      ...updates,
    };
    
    await saveAuth(updated);
    return updated;
  } catch (error) {
    console.log("Error updating auth:", error);
    throw error;
  }
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync(KEY);
}