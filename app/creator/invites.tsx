import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import * as Clipboard from "expo-clipboard";
import PageHead from "@/components/PageHead";
import { api } from "@/libs/api";
import { images } from "@/constants/image";
import { icons } from "@/constants/icons";
import { useToast } from "@/context/FlashMessageContext";

interface PendingInvite {
  id: string;
  status: "pending" | "accepted" | "declined";
  live_stream: {
    id: string;
    title: string;
    thumbnail: string | null;
    scheduled_start_time: string | null;
  };
  host_creator: {
    channel_name: string;
    avatar_url: string | null;
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return "Unscheduled";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Invites() {
  const { show: showToast } = useToast();
  const [inviteKey, setInviteKey] = useState<string | null>(null);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [keyRes, invitesRes] = await Promise.all([
        api.get("creators/me/invite_key"),
        api.get("creators/me/pending_invites"),
      ]);
      setInviteKey(keyRes.data?.invite_key ?? null);
      const list = invitesRes.data?.invites ?? invitesRes.data ?? [];
      setInvites(list);
    } catch {
      showToast({ message: "Failed to load invites.", type: "danger", title: "Error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const copyKey = async () => {
    if (!inviteKey) return;
    await Clipboard.setStringAsync(inviteKey);
    showToast({ title: "Copied!", message: "Invite key copied to clipboard.", type: "success" });
  };

  const respond = async (invite: PendingInvite, action: "accept" | "decline") => {
    setResponding(invite.id);
    try {
      await api.put(`streams/${invite.live_stream.id}/invites/${invite.id}/${action}`);
      showToast({
        message: action === "accept" ? "Invite accepted!" : "Invite declined.",
        type: action === "accept" ? "success" : "info",
        title: action === "accept" ? "Accepted" : "Declined",
      });
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
    } catch {
      showToast({ message: "Could not respond. Try again.", type: "danger", title: "Error" });
    } finally {
      setResponding(null);
    }
  };

  return (
    <View className="flex-1 bg-CreatorBG">
      <PageHead title="Your Invites" />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#e63946" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* ─── Invite Key ─── */}
          <View className="mt-6 mb-8">
            <Text className="text-textSecondary font-MonMedium text-xs uppercase tracking-widest mb-3">
              Your Invite Key
            </Text>
            <Text className="text-textSecondary font-MonRegular text-xs mb-3">
              Share this key with a host so they can invite you to their stream.
            </Text>
            <View className="flex-row items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5">
              <Text
                className="flex-1 text-textPrimary font-MonMedium tracking-widest"
                numberOfLines={1}
              >
                {inviteKey ?? "—"}
              </Text>
              <Pressable onPress={copyKey}>
                <Image
                  source={icons.clipboard}
                  className="w-5 h-5"
                  tintColor="#ffffff80"
                />
              </Pressable>
            </View>
          </View>

          {/* ─── Pending Invites ─── */}
          <Text className="text-textSecondary font-MonMedium text-xs uppercase tracking-widest mb-3">
            Pending Invites
          </Text>

          {invites.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-textSecondary font-MonRegular text-sm">
                No pending invites
              </Text>
            </View>
          ) : (
            invites.map((invite) => (
              <View
                key={invite.id}
                className="bg-white/5 border border-white/8 rounded-2xl p-4 mb-4"
              >
                {/* Stream info */}
                <View className="flex-row items-center gap-3 mb-4">
                  <Image
                    source={
                      invite.live_stream.thumbnail
                        ? { uri: invite.live_stream.thumbnail }
                        : images.chaDefault
                    }
                    className="w-12 h-12 rounded-xl"
                  />
                  <View className="flex-1">
                    <Text
                      className="text-textPrimary font-MonBold text-sm"
                      numberOfLines={2}
                    >
                      {invite.live_stream.title}
                    </Text>
                    <Text className="text-textSecondary font-MonRegular text-xs mt-0.5">
                      {formatDate(invite.live_stream.scheduled_start_time)}
                    </Text>
                  </View>
                </View>

                {/* Host info */}
                <View className="flex-row items-center gap-2 mb-4">
                  <Image
                    source={
                      invite.host_creator.avatar_url
                        ? { uri: invite.host_creator.avatar_url }
                        : images.chaDefault
                    }
                    className="w-6 h-6 rounded-full"
                  />
                  <Text className="text-textSecondary font-MonRegular text-xs">
                    Invited by{" "}
                    <Text className="text-textPrimary font-MonMedium">
                      {invite.host_creator.channel_name}
                    </Text>
                  </Text>
                </View>

                {/* Actions */}
                <View className="flex-row gap-3">
                  <Pressable
                    className="flex-1 border border-white/15 rounded-xl py-2.5 items-center"
                    onPress={() => respond(invite, "decline")}
                    disabled={responding === invite.id}
                  >
                    {responding === invite.id ? (
                      <ActivityIndicator size={14} color="#aaa" />
                    ) : (
                      <Text className="text-textSecondary font-MonBold text-sm">Decline</Text>
                    )}
                  </Pressable>
                  <Pressable
                    className="flex-1 bg-primary rounded-xl py-2.5 items-center"
                    onPress={() => respond(invite, "accept")}
                    disabled={responding === invite.id}
                  >
                    {responding === invite.id ? (
                      <ActivityIndicator size={14} color="#fff" />
                    ) : (
                      <Text className="text-white font-MonBold text-sm">Accept</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
