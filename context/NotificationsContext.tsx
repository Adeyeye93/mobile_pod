import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Notifications from "expo-notifications";
import {
  StoredNotification,
  loadNotifications,
  markAllRead,
  clearNotifications,
  saveNotification,
} from "@/libs/pushNotifications";

interface NotificationsContextValue {
  notifications: StoredNotification[];
  unreadCount: number;
  markRead: () => Promise<void>;
  clear: () => Promise<void>;
  reload: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be inside NotificationsProvider");
  return ctx;
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const listenerRef = useRef<Notifications.EventSubscription | null>(null);

  const reload = useCallback(async () => {
    const list = await loadNotifications();
    setNotifications(list);
  }, []);

  // Load from storage on mount
  useEffect(() => {
    reload();
  }, [reload]);

  // Listen for incoming notifications while app is foregrounded
  useEffect(() => {
    listenerRef.current = Notifications.addNotificationReceivedListener(async (notif) => {
      const updated = await saveNotification(notif);
      setNotifications(updated);
    });
    return () => {
      listenerRef.current?.remove();
    };
  }, []);

  const markRead = useCallback(async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clear = useCallback(async () => {
    await clearNotifications();
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markRead, clear, reload }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
