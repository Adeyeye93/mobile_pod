import PageHead from "@/components/PageHead";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/FlashMessageContext";
import { api } from "@/libs/api";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfile() {
  const router = useRouter();
  const { username, email, avatarUrl, bio, updateProfile } = useAuth();
  const { show } = useToast();

  const [displayName, setDisplayName] = useState(username ?? "");
  const [bioText, setBioText] = useState(bio ?? "");
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentAvatar = localAvatar || avatarUrl;

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    setLocalAvatar(asset.uri);

    const form = new FormData();
    form.append("avatar", {
      uri: asset.uri,
      name: "avatar.jpg",
      type: "image/jpeg",
    } as any);

    setAvatarUploading(true);
    try {
      const res = await api.post("users/me/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newUrl = res.data?.avatar_url ?? asset.uri;
      setLocalAvatar(newUrl);
      updateProfile({ avatarUrl: newUrl });
      show({ title: "Photo updated", message: "Your profile photo has been changed.", type: "success" });
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      const msg = err?.message ?? err?.response?.data?.message ?? JSON.stringify(err);
      console.error("[EditProfile] POST users/me/avatar failed:", status, msg);
      show({ title: "Upload failed", message: `${status ? `[${status}] ` : ""}${msg}`, type: "danger" });
      setLocalAvatar(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("users/me", {
        username: displayName.trim(),
        bio: bioText.trim(),
      });
      updateProfile({ username: displayName.trim(), bio: bioText.trim() });
      show({ title: "Profile saved", message: "Your changes have been saved.", type: "success" });
      router.back();
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      const msg = err?.message ?? err?.response?.data?.message ?? JSON.stringify(err);
      console.error("[EditProfile] PUT users/me failed:", status, msg);
      show({ title: "Save failed", message: `${status ? `[${status}] ` : ""}${msg}`, type: "danger" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PageHead title="Edit Profile" />

        {/* Avatar */}
        <View className="items-center py-4">
          <Pressable onPress={pickPhoto} disabled={avatarUploading}>
            <View className="w-24 h-24 rounded-full overflow-hidden">
              {currentAvatar ? (
                <Image
                  source={{ uri: currentAvatar }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-primary/20 items-center justify-center">
                  <Text className="text-primary font-MonBold text-3xl">
                    {(displayName ?? "U")[0].toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary items-center justify-center">
              {avatarUploading ? (
                <ActivityIndicator size={12} color="#fff" />
              ) : (
                <Text className="text-white font-MonBold text-base leading-none">+</Text>
              )}
            </View>
          </Pressable>
          <Text className="text-textSecondary font-MonRegular text-xs mt-3">
            Tap to change photo
          </Text>
        </View>

        {/* Display Name */}
        <View className="w-full flex flex-col gap-1">
          <Text className="font-MonBold text-textSecondary mb-1">Display Name</Text>
          <View className="bg-[#40434d] rounded-xl py-2 px-6 h-14 flex flex-row items-center">
            <TextInput
              className="text-textSecondary font-MonBold flex-1 h-14"
              placeholderTextColor="#9ca3af"
              placeholder="Your name"
              value={displayName}
              onChangeText={setDisplayName}
            />
          </View>
        </View>

        {/* Email — read-only */}
        <View className="w-full flex flex-col gap-1">
          <Text className="font-MonBold text-textSecondary mb-1">Email</Text>
          <View className="bg-[#2a2d35] rounded-xl py-2 px-6 h-14 flex flex-row items-center">
            <TextInput
              className="text-gray-500 font-MonBold flex-1 h-14"
              value={email}
              editable={false}
            />
          </View>
        </View>

        {/* Bio */}
        <View className="w-full flex flex-col gap-1">
          <Text className="font-MonBold text-textSecondary mb-1">Bio</Text>
          <TextInput
            className="bg-[#40434d] text-textSecondary font-MonBold rounded-xl py-2 px-3 h-32"
            placeholderTextColor="#9ca3af"
            placeholder="Tell listeners about yourself…"
            value={bioText}
            onChangeText={setBioText}
            multiline
            style={{ textAlignVertical: "top" }}
            numberOfLines={4}
          />
        </View>

        <Pressable
          onPress={save}
          disabled={saving || avatarUploading}
          className="h-12 rounded-xl bg-primary items-center justify-center mt-2"
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-MonBold">Save Changes</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
