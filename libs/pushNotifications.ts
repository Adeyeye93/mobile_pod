import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/libs/api";

const STORAGE_KEY = "echo_notifications";

export interface StoredNotification {
  id: string;
  title: string;
  body: string;
  data: Record<string, any>;
  receivedAt: string;
  read: boolean;
}

// ─── Token registration ───────────────────────────────────────────────────────

export async function registerPushToken(): Promise<void> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await api.put("users/me/push_token", { push_token: token }).catch(() => {});
  } catch {
    // FCM not configured yet (requires google-services.json in android/app/)
  }
}

// ─── Local notification storage ───────────────────────────────────────────────

export async function loadNotifications(): Promise<StoredNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveNotification(
  notif: Notifications.Notification,
): Promise<StoredNotification[]> {
  const current = await loadNotifications();
  const item: StoredNotification = {
    id: notif.request.identifier,
    title: notif.request.content.title ?? "",
    body: notif.request.content.body ?? "",
    data: (notif.request.content.data as Record<string, any>) ?? {},
    receivedAt: new Date().toISOString(),
    read: false,
  };
  const updated = [item, ...current].slice(0, 50);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export async function markAllRead(): Promise<void> {
  const current = await loadNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function clearNotifications(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
