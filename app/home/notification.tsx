import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { useEffect } from "react";
import PageHead from "@/components/PageHead";
import { useNotifications } from "@/context/NotificationsContext";
import { StoredNotification } from "@/libs/pushNotifications";
import { icons } from "@/constants/icons";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

type NotifType = "invite" | "accepted" | "declined" | "reminder" | "default";

function detectType(notif: StoredNotification): NotifType {
  const body = (notif.body + notif.title).toLowerCase();
  if (body.includes("invited")) return "invite";
  if (body.includes("accepted")) return "accepted";
  if (body.includes("won't be joining") || body.includes("declined")) return "declined";
  if (body.includes("starting") || body.includes("reminder") || body.includes("minutes")) return "reminder";
  return "default";
}

const TYPE_CONFIG: Record<NotifType, { icon: any; bg: string; tint: string }> = {
  invite:   { icon: icons.invite,   bg: "bg-blue-500/15",   tint: "#60a5fa" },
  accepted: { icon: icons.selected, bg: "bg-green-500/15",  tint: "#4ade80" },
  declined: { icon: icons.close,    bg: "bg-red-500/15",    tint: "#f87171" },
  reminder: { icon: icons.notification, bg: "bg-orange-500/15", tint: "#fb923c" },
  default:  { icon: icons.notification, bg: "bg-white/8",   tint: "#a0a0a0" },
};

// ─── Notification item ────────────────────────────────────────────────────────

function NotifItem({ notif }: { notif: StoredNotification }) {
  const type = detectType(notif);
  const cfg = TYPE_CONFIG[type];

  return (
    <View
      className={`flex-row items-start gap-3 px-4 py-4 ${!notif.read ? "bg-white/4" : ""}`}
    >
      <View className={`w-10 h-10 rounded-full ${cfg.bg} items-center justify-center flex-shrink-0`}>
        <Image source={cfg.icon} className="w-5 h-5" tintColor={cfg.tint} />
      </View>
      <View className="flex-1">
        {notif.title ? (
          <Text className="text-textPrimary font-MonBold text-sm leading-5">
            {notif.title}
          </Text>
        ) : null}
        <Text className="text-textSecondary font-MonRegular text-sm leading-5 mt-0.5">
          {notif.body}
        </Text>
        <Text className="text-[#6b7fa3] font-MonRegular text-xs mt-1">
          {timeAgo(notif.receivedAt)}
        </Text>
      </View>
      {!notif.read && (
        <View className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
      )}
    </View>
  );
}

function Separator() {
  return <View className="h-px bg-white/5 mx-4" />;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Notification() {
  const { notifications, unreadCount, markRead, clear } = useNotifications();

  // Mark all read when screen opens
  useEffect(() => {
    if (unreadCount > 0) markRead();
  }, []);

  return (
    <View className="flex-1 bg-background">
      <PageHead
        title="Notifications"
        customIcons={
          notifications.length > 0
            ? [{ icon: icons.close, onPress: clear, testID: "clear-all" }]
            : []
        }
      />

      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-4 pb-20">
          <View className="w-16 h-16 rounded-full bg-white/5 items-center justify-center">
            <Image source={icons.notification} className="w-8 h-8 opacity-40" />
          </View>
          <Text className="text-textSecondary font-MonRegular text-sm">
            No notifications yet
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {unreadCount > 0 && (
            <View className="px-4 py-3">
              <Text className="text-[#6b7fa3] font-MonMedium text-xs uppercase tracking-widest">
                New · {unreadCount}
              </Text>
            </View>
          )}

          {notifications.map((notif, i) => (
            <View key={notif.id}>
              <NotifItem notif={notif} />
              {i < notifications.length - 1 && <Separator />}
            </View>
          ))}

          <Pressable onPress={clear} className="items-center py-5">
            <Text className="text-[#6b7fa3] font-MonRegular text-xs">
              Clear all notifications
            </Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}
