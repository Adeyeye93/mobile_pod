import {
  LogoutSheetContext,
  Sheet,
  useLogoutSheet,
} from "@/context/CreateSheetContext";
import { useAuth } from "@/context/AuthContext";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function LogoutSheet() {
  const { ref } = useLogoutSheet();
  const { signOut, username } = useAuth();

  const handleClose = () => ref.current?.close();

  const handleLogOut = async () => {
    ref.current?.close();
    await signOut();
  };

  return (
    <Sheet
      context={LogoutSheetContext}
      snapPoints={[1, 240]}
      showCloseButton={false}
    >
      <View className="px-6 pt-7 pb-6 gap-5">
        {/* Icon + heading */}
        <View className="items-center gap-3">
          <View className="w-14 h-14 rounded-full bg-red-500/15 items-center justify-center">
            <Ionicons name="log-out-outline" size={26} color="#ef4444" />
          </View>
          <Text className="text-textPrimary font-MonBold text-lg">
            Log out
          </Text>
          <Text className="text-textSecondary font-MonRegular text-sm text-center leading-5">
            Are you sure you want to log out
            {username ? ` as ${username}` : ""}?
          </Text>
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3">
          <Pressable
            onPress={handleClose}
            className="flex-1 h-12 rounded-xl border border-white/15 items-center justify-center"
          >
            <Text className="text-textPrimary font-MonMedium">Cancel</Text>
          </Pressable>

          <Pressable
            onPress={handleLogOut}
            className="flex-1 h-12 rounded-xl bg-red-500 items-center justify-center"
          >
            <Text className="text-white font-MonBold">Log out</Text>
          </Pressable>
        </View>
      </View>
    </Sheet>
  );
}
