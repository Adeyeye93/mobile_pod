import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import {
  InviteSheetContext,
  Sheet,
  useInviteSheet,
} from "@/context/CreateSheetContext";
import { useToast } from "@/context/FlashMessageContext";
import { api } from "@/libs/api";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import Divider from "../divider";
import Input from "../form/input";

interface GuestPreview {
  id: string;
  channel_name: string;
  avatar_url: string | null;
}

const InviteSheet = () => {
  const { ref: inviteSheetRef, data: stream_id } = useInviteSheet();
  const { show: showToast } = useToast();

  const [inviteKey, setInviteKey] = useState("");
  const [step, setStep] = useState<"input" | "preview">("input");
  const [guest, setGuest] = useState<GuestPreview | null>(null);
  const [isLooking, setIsLooking] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const reset = () => {
    setInviteKey("");
    setStep("input");
    setGuest(null);
  };

  const pasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setInviteKey(text.trim());
  };

  const handleLookup = async () => {
    if (!inviteKey.trim()) return;
    setIsLooking(true);
    try {
      const res = await api.get(`creators/lookup?invite_key=${inviteKey.trim()}`);
      const creator = res.data?.creator ?? res.data;
      if (!creator?.id) throw new Error("Not found");
      setGuest(creator);
      setStep("preview");
    } catch {
      showToast({
        message: "No creator found with that invite key.",
        type: "danger",
        title: "Not Found",
      });
    } finally {
      setIsLooking(false);
    }
  };

  const parseInviteResponse = (data: any) => {
    if (data?.success) {
      return { ok: true, message: "Invite sent!", type: "success", title: "Invite Sent" };
    }
    const map: Record<string, string> = {
      invite_deadline_passed: "You can only invite guests up to 1 hour before the stream.",
      guest_cap_reached: "Maximum number of guests already invited.",
      invalid_invite_key: "Invalid invite key.",
      cannot_invite_yourself: "You cannot invite yourself.",
      already_invited: "This creator is already invited.",
    };
    return {
      ok: false,
      message: map[data?.reason] ?? "Something went wrong.",
      type: "danger",
      title: "Invite Failed",
    };
  };

  const handleInvite = async () => {
    setIsInviting(true);
    try {
      const res = await api.post(`streams/${stream_id}/invites`, {
        invite_key: inviteKey.trim(),
      });
      const result = parseInviteResponse(res.data);
      showToast({ message: result.message, type: result.type as any, title: result.title });
      if (result.ok) {
        reset();
        inviteSheetRef.current?.collapse();
      }
    } catch {
      showToast({ message: "Something went wrong. Try again.", type: "danger", title: "Error" });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Sheet context={InviteSheetContext} snapPoints={[0.00001, 400]}>
      <View className="w-full p-5">
        <Text className="text-textPrimary font-MonBold text-xl text-center">
          Invite Collaborator
        </Text>
        <Text className="text-textSecondary font-MonRegular text-xs text-center mt-1">
          {step === "input"
            ? "Enter or paste the invite key of the creator you want to invite."
            : "Confirm you want to invite this creator."}
        </Text>

        <Divider gap={14} value={370} />

        {/* ─── Step 1: Key input ─── */}
        {step === "input" && (
          <View className="gap-4">
            <Input
              placeholder="Paste invite key here"
              value={inviteKey}
              onChangeText={setInviteKey}
              asAction
              actionImage={icons.clipboard}
              actionFun={pasteFromClipboard}
            />
            <View className="flex-row gap-3 mt-2">
              <Pressable
                className="flex-1 bg-white/8 rounded-xl py-3 items-center"
                onPress={() => { reset(); inviteSheetRef.current?.collapse(); }}
              >
                <Text className="text-textPrimary font-MonBold">Cancel</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-primary rounded-xl py-3 items-center"
                onPress={handleLookup}
                disabled={!inviteKey.trim() || isLooking}
              >
                {isLooking
                  ? <ActivityIndicator color="#fff" />
                  : <Text className="text-white font-MonBold">Look Up</Text>}
              </Pressable>
            </View>
          </View>
        )}

        {/* ─── Step 2: Creator preview ─── */}
        {step === "preview" && guest && (
          <View className="gap-5">
            <View className="flex-row items-center gap-4 bg-white/5 rounded-2xl p-4">
              <Image
                source={guest.avatar_url ? { uri: guest.avatar_url } : images.thumbnail}
                className="w-14 h-14 rounded-full"
              />
              <View className="flex-1">
                <Text className="text-textPrimary font-MonBold text-base">
                  {guest.channel_name}
                </Text>
                <Text className="text-textSecondary font-MonRegular text-xs mt-0.5">
                  Will be invited as a guest
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 bg-white/8 rounded-xl py-3 items-center"
                onPress={() => setStep("input")}
              >
                <Text className="text-textPrimary font-MonBold">Back</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-primary rounded-xl py-3 items-center"
                onPress={handleInvite}
                disabled={isInviting}
              >
                {isInviting
                  ? <ActivityIndicator color="#fff" />
                  : <Text className="text-white font-MonBold">Send Invite</Text>}
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Sheet>
  );
};

export default InviteSheet;
