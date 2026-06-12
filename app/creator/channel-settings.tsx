import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import PageHead from "@/components/PageHead";
import { useToast } from "@/context/FlashMessageContext";
import { api } from "@/libs/api";
import { images } from "@/constants/image";

interface CreatorProfile {
  channel_name: string;
  bio: string;
  avatar_url: string | null;
}

export default function ChannelSettings() {
  const router = useRouter();
  const { show } = useToast();
  const [profile, setProfile] = useState<CreatorProfile>({
    channel_name: "",
    bio: "",
    avatar_url: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    api.get("creator/profile")
      .then((res) => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const form = new FormData();
    form.append("avatar", {
      uri: asset.uri,
      name: "avatar.jpg",
      type: "image/jpeg",
    } as any);

    setAvatarUploading(true);
    try {
      const res = await api.post("creator/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((p) => ({ ...p, avatar_url: res.data.avatar_url }));
      show({ title: "Photo updated", message: "Channel avatar has been changed.", type: "success" });
    } catch {
      show({ title: "Upload failed", message: "Could not upload avatar. Try again.", type: "danger" });
    } finally {
      setAvatarUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("creator/profile", {
        channel_name: profile.channel_name,
        bio: profile.bio,
      });
      show({ title: "Channel saved", message: "Your channel settings have been updated.", type: "success" });
      router.back();
    } catch {
      show({ title: "Save failed", message: "Could not save changes. Try again.", type: "danger" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-CreatorBG items-center justify-center">
        <ActivityIndicator color="#e63946" />
      </View>
    );
  }

  const avatarSource = profile.avatar_url
    ? { uri: profile.avatar_url }
    : images.chaDefault;

  return (
    <View className="flex-1 bg-CreatorBG">
      <PageHead title="Channel Settings" />
      <ScrollView
        className="flex-1 px-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View className="items-center mt-8 mb-8">
          <Pressable onPress={pickAvatar} disabled={avatarUploading}>
            <View className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10">
              <Image source={avatarSource} className="w-full h-full" resizeMode="cover" />
            </View>
            <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary items-center justify-center">
              {avatarUploading ? (
                <ActivityIndicator size={12} color="#fff" />
              ) : (
                <Text className="text-white font-MonBold text-xs">+</Text>
              )}
            </View>
          </Pressable>
          <Text className="text-textSecondary font-MonRegular text-xs mt-2">
            Tap to change avatar
          </Text>
        </View>

        {/* Channel Name */}
        <View className="mb-5">
          <Text className="text-textSecondary font-MonMedium text-xs mb-2 uppercase tracking-widest">
            Channel Name
          </Text>
          <TextInput
            value={profile.channel_name}
            onChangeText={(v) => setProfile((p) => ({ ...p, channel_name: v }))}
            placeholder="Your channel name"
            placeholderTextColor="#ffffff40"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-textPrimary font-MonMedium"
          />
        </View>

        {/* Bio */}
        <View className="mb-8">
          <Text className="text-textSecondary font-MonMedium text-xs mb-2 uppercase tracking-widest">
            Bio
          </Text>
          <TextInput
            value={profile.bio}
            onChangeText={(v) => setProfile((p) => ({ ...p, bio: v }))}
            placeholder="Tell listeners about your channel"
            placeholderTextColor="#ffffff40"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-textPrimary font-MonMedium min-h-[100px]"
          />
        </View>

        {/* Save */}
        <Pressable
          onPress={save}
          disabled={saving}
          className="bg-primary rounded-xl py-4 items-center mb-10"
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-MonBold text-base">Save Changes</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
