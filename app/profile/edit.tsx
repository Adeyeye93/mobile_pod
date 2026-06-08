import PageHead from "@/components/PageHead";
import Input from "@/components/form/input";
import { useAuth } from "@/context/AuthContext";
import { View, Text, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import { useState } from "react";
import { icons } from "@/constants/icons";

export default function EditProfile() {
  const { username, user } = useAuth();
  const [displayName, setDisplayName] = useState(username ?? "");
  const [bio, setBio] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <PageHead title="Edit Profile" />

        {/* Avatar placeholder */}
        <View className="items-center py-4">
          <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center">
            <Text className="text-primary font-MonBold text-3xl">
              {(username ?? "U")[0].toUpperCase()}
            </Text>
          </View>
          <Pressable className="mt-3 flex-row items-center gap-1">
            <Image source={icons.redirect2} className="w-4 h-4" tintColor="#4169e1" />
            <Text className="text-primary font-MonMedium text-sm">
              Change photo
            </Text>
          </Pressable>
        </View>

        <Input
          label="Display Name"
          placeholder="Your name"
          value={displayName}
          onChangeText={setDisplayName}
        />
        <Input
          label="Email"
          placeholder="Email"
          value={user?.email ?? ""}
          editable={false}
        />
        <Input
          label="Bio"
          placeholder="Tell listeners about yourself…"
          value={bio}
          onChangeText={setBio}
          textArea
        />

        <Pressable className="h-12 rounded-xl bg-primary items-center justify-center mt-2">
          <Text className="text-white font-MonBold">Save Changes</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
