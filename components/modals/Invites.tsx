import { icons } from "@/constants/icons";
import {
  InviteSheetContext,
  Sheet,
  useInviteSheet,
} from "@/context/CreateSheetContext";
import { useToast } from "@/context/FlashMessageContext";
import { api } from "@/libs/api";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Divider from "../divider";
import Input from "../form/input";

const InviteSheet = () => {
  const { ref: inviteSheetRef, data: stream_id } = useInviteSheet();

  const [inviteKey, setInviteKey] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const { show: showToast } = useToast();

  const pasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setInviteKey(text);
  };

  const parseInviteResponse = (data: any) => {
    if (data?.success) {
      return {
        ok: true,
        message: "Invite sent successfully",
        type: "success",
        title: "Invite Sent",
      };
    }

    // Soft business rule errors mapped to user-friendly messages
    const map = {
      invite_deadline_passed:
        "You can only invite guests up to 1 hour before the stream starts.",
      guest_cap_reached: "Maximum number of guests already invited.",
      invalid_invite_key: "Invalid invite key.",
      cannot_invite_yourself: "You cannot invite yourself.",
      already_invited: "This creator is already invited.",
    };

    return {
      ok: false,
      message: map[data?.reason as keyof typeof map] || "Something went wrong.",
      type: "danger",
      title: "Invite Failed",
    };
  };

  const handleInvite = async () => {
    try {
      setIsInviting(true);

      const res = await api.post(`/streams/${stream_id}/invites`, {
        stream_id,
        invite_key: inviteKey,
      });

      const result = parseInviteResponse(res.data);

      showToast({ message: result.message, type: result.type as ToastType, title: result.title });

      if (result.ok) {
        inviteSheetRef.current?.collapse();
      }
    } catch (err) {
      console.error("Invite error", err);
      showToast({
        message: "Something went wrong. Please try again.",
        type: "danger",
        title: "Invite Failed",
      });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Sheet context={InviteSheetContext} snapPoints={[0.00001, 350]}>
      <View className="w-full h-fit p-4">
        <View className="w-full h-16 flex items-center justify-end">
          <Text className="text-textPrimary font-MonBold text-xl">
            Invite Collaborators
          </Text>
          <Text className="text-xs font-MonThin text-textPrimary">
            Enter or paste the invite key of the creator you want to invite.
          </Text>
        </View>

        <Divider gap={10} value={370} />

        <View className="flex flex-col items-center w-full mt-4">
          <Input
            placeholder="Paste in the invite key"
            editable={false}
            value={inviteKey}
            onChangeText={setInviteKey}
            asAction
            actionImage={icons.clipboard}
            actionFun={pasteFromClipboard} // user manually pastes
          />

          <View className="flex flex-row items-center justify-between mt-6 w-full">
            <Pressable
              className="bg-[#80808048] rounded-xl py-3 px-6"
              onPress={() => inviteSheetRef.current?.collapse()}
            >
              <Text className="text-textPrimary font-MonBold text-lg">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              className="bg-primary rounded-xl py-3 px-6"
              onPress={handleInvite}
              disabled={!inviteKey || isInviting}
            >
              {isInviting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-textPrimary font-MonBold text-lg">
                  Invite
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Sheet>
  );
};
export default InviteSheet;
