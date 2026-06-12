import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import { api } from "@/libs/api";
import { useToast } from "@/context/FlashMessageContext";
import { createAudioPlayer } from "expo-audio";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UploadStage = "idle" | "audio" | "record";

const AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/wav",
];

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

async function detectDuration(uri: string): Promise<number> {
  return new Promise((resolve) => {
    let done = false;
    const player = createAudioPlayer({ uri });
    const timeout = setTimeout(() => {
      if (!done) { done = true; player.remove(); resolve(0); }
    }, 6000);
    const interval = setInterval(() => {
      if (player.duration > 0) {
        clearInterval(interval);
        clearTimeout(timeout);
        if (!done) {
          done = true;
          const d = Math.round(player.duration);
          player.remove();
          resolve(d);
        }
      }
    }, 200);
  });
}

export default function UploadEpisode() {
  const router = useRouter();
  const { show } = useToast();

  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioName, setAudioName] = useState("");
  const [audioMime, setAudioMime] = useState("audio/mpeg");
  const [audioDuration, setAudioDuration] = useState(0);
  const [detectingDuration, setDetectingDuration] = useState(false);

  const [thumbLocal, setThumbLocal] = useState<string | null>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [thumbUploading, setThumbUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [categoryVisible, setCategoryVisible] = useState(false);

  const [stage, setStage] = useState<UploadStage>("idle");
  const [stageLabel, setStageLabel] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("userInterests").then((raw) => {
      if (raw) {
        setCategories(JSON.parse(raw));
      } else {
        api
          .get("/interests")
          .then((r) => {
            const list = r.data.data ?? r.data.interests ?? [];
            setCategories(list);
            AsyncStorage.setItem("userInterests", JSON.stringify(list));
          })
          .catch(() => {});
      }
    });
  }, []);

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: AUDIO_TYPES,
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setAudioUri(asset.uri);
    setAudioName(asset.name ?? "audio_file");
    setAudioMime(asset.mimeType ?? "audio/mpeg");
    setAudioDuration(0);
    if (!title) setTitle(asset.name?.replace(/\.[^.]+$/, "") ?? "");
    setDetectingDuration(true);
    const dur = await detectDuration(asset.uri);
    setAudioDuration(dur);
    setDetectingDuration(false);
  };

  const pickThumbnail = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      show({ title: "Permission denied", message: "Camera roll access is needed", type: "danger" });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const contentType = asset.mimeType ?? "image/jpeg";
    setThumbUploading(true);
    try {
      const presignRes = await api.post("/uploads/thumbnail_presign", { content_type: contentType });
      const { upload_url, thumbnail_url } = presignRes.data;
      const blob = await (await fetch(asset.uri)).blob();
      const s3 = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: blob,
      });
      if (!s3.ok) throw new Error("S3 upload failed");
      setThumbLocal(asset.uri);
      setThumbUrl(thumbnail_url);
    } catch {
      show({ title: "Thumbnail upload failed", message: "Please try again", type: "danger" });
    } finally {
      setThumbUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!audioUri) {
      show({ title: "No audio selected", message: "Please pick an audio file first", type: "danger" });
      return;
    }
    if (!title.trim()) {
      show({ title: "Title required", message: "Please enter an episode title", type: "danger" });
      return;
    }

    try {
      setStage("audio");
      setStageLabel("Uploading audio…");
      const presignRes = await api.post("/uploads/audio_presign", { content_type: audioMime });
      const { upload_url, audio_url } = presignRes.data;

      const audioBlob = await (await fetch(audioUri)).blob();
      const s3 = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": audioMime },
        body: audioBlob,
      });
      if (!s3.ok) throw new Error(`Audio upload failed (${s3.status})`);

      setStage("record");
      setStageLabel("Publishing episode…");
      await api.post("/recordings", {
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        thumbnail_url: thumbUrl || null,
        master_url: audio_url,
        duration_seconds: audioDuration,
      });

      show({ title: "Published!", message: `"${title}" is now live`, type: "success" });
      router.back();
    } catch (err: any) {
      setStage("idle");
      show({
        title: "Publish failed",
        message: err.message ?? "Something went wrong. Please try again.",
        type: "danger",
      });
    }
  };

  const busy = stage !== "idle" || thumbUploading || detectingDuration;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: "#111318" }}
        contentContainerStyle={{ paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingTop: Platform.OS === "ios" ? 56 : 40,
            paddingHorizontal: 20,
            paddingBottom: 28,
            gap: 14,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 38, height: 38, borderRadius: 19,
              backgroundColor: "rgba(255,255,255,0.08)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Image style={{ width: 18, height: 18 }} tintColor="#fff" source={icons.backPage} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#f9fafb", fontFamily: "bold", fontSize: 20 }}>
              Upload Episode
            </Text>
            <Text style={{ color: "#6b7280", fontFamily: "regular", fontSize: 12, marginTop: 2 }}>
              Publish a pre-recorded audio episode
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 24 }}>

          {/* Audio file picker */}
          <View style={{ gap: 8 }}>
            <Text style={labelStyle}>Audio File <Text style={{ color: "#e63946" }}>*</Text></Text>
            <Pressable
              onPress={busy ? undefined : pickAudio}
              style={{
                backgroundColor: audioUri ? "#1a1c24" : "rgba(230,57,70,0.06)",
                borderWidth: 1.5,
                borderColor: audioUri ? "rgba(255,255,255,0.07)" : "rgba(230,57,70,0.25)",
                borderStyle: audioUri ? "solid" : "dashed",
                borderRadius: 16,
                padding: 18,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 48, height: 48, borderRadius: 12,
                  backgroundColor: audioUri ? "#e63946" : "rgba(230,57,70,0.12)",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <Image
                  style={{ width: 22, height: 22 }}
                  tintColor={audioUri ? "#fff" : "#e63946"}
                  source={icons.play}
                />
              </View>
              <View style={{ flex: 1 }}>
                {audioUri ? (
                  <>
                    <Text
                      style={{ color: "#f9fafb", fontFamily: "bold", fontSize: 14 }}
                      numberOfLines={1}
                    >
                      {audioName}
                    </Text>
                    <Text style={{ color: "#6b7280", fontFamily: "regular", fontSize: 12, marginTop: 3 }}>
                      {detectingDuration
                        ? "Reading duration…"
                        : audioDuration > 0
                        ? formatDuration(audioDuration)
                        : "Duration unknown"}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={{ color: "#e63946", fontFamily: "bold", fontSize: 14 }}>
                      Tap to select audio
                    </Text>
                    <Text style={{ color: "#6b7280", fontFamily: "regular", fontSize: 12, marginTop: 3 }}>
                      MP3 · M4A · AAC · OGG · WAV
                    </Text>
                  </>
                )}
              </View>
              {audioUri && (
                <Image style={{ width: 16, height: 16 }} tintColor="#4b5563" source={icons.edit} />
              )}
            </Pressable>
          </View>

          {/* Thumbnail */}
          <View style={{ gap: 8 }}>
            <Text style={labelStyle}>
              Thumbnail{" "}
              <Text style={{ color: "#4b5563", textTransform: "none" }}>(optional)</Text>
            </Text>
            <Pressable
              onPress={busy ? undefined : pickThumbnail}
              style={{
                height: 156,
                borderRadius: 16,
                overflow: "hidden",
                backgroundColor: "#1a1c24",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.06)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {thumbUploading ? (
                <ActivityIndicator color="#e63946" />
              ) : thumbLocal ? (
                <>
                  <Image
                    source={{ uri: thumbLocal }}
                    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      position: "absolute", bottom: 10, right: 10,
                      backgroundColor: "rgba(0,0,0,0.65)",
                      paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: "#fff", fontFamily: "medium", fontSize: 11 }}>
                      Tap to change
                    </Text>
                  </View>
                </>
              ) : (
                <View style={{ alignItems: "center", gap: 8 }}>
                  <Image style={{ width: 28, height: 28 }} tintColor="#4b5563" source={icons.plus} />
                  <Text style={{ color: "#6b7280", fontFamily: "regular", fontSize: 13 }}>
                    Add cover image (16:9)
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Title */}
          <View style={{ gap: 8 }}>
            <Text style={labelStyle}>
              Title <Text style={{ color: "#e63946" }}>*</Text>
            </Text>
            <TextInput
              style={inputStyle}
              placeholder="Give your episode a title…"
              placeholderTextColor="#4b5563"
              value={title}
              onChangeText={setTitle}
              maxLength={120}
            />
          </View>

          {/* Description */}
          <View style={{ gap: 8 }}>
            <Text style={labelStyle}>
              Description{" "}
              <Text style={{ color: "#4b5563", textTransform: "none" }}>(optional)</Text>
            </Text>
            <TextInput
              style={[inputStyle, { minHeight: 100, textAlignVertical: "top", paddingTop: 14 }]}
              placeholder="What's this episode about?"
              placeholderTextColor="#4b5563"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={1000}
            />
          </View>

          {/* Category */}
          <View style={{ gap: 8 }}>
            <Text style={labelStyle}>
              Category{" "}
              <Text style={{ color: "#4b5563", textTransform: "none" }}>(optional)</Text>
            </Text>
            <Pressable
              onPress={() => setCategoryVisible(true)}
              style={[inputStyle, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}
            >
              <Text style={{ color: category ? "#f9fafb" : "#4b5563", fontFamily: "regular", fontSize: 15 }}>
                {category || "Select a category"}
              </Text>
              <Image style={{ width: 14, height: 14 }} tintColor="#6b7280" source={icons.next} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Publish button */}
      <View
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: "#111318",
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Platform.OS === "ios" ? 40 : 28,
          borderTopWidth: 0.5,
          borderTopColor: "rgba(255,255,255,0.07)",
        }}
      >
        {stage !== "idle" && (
          <Text
            style={{
              color: "#6b7280", fontFamily: "regular", fontSize: 12,
              textAlign: "center", marginBottom: 10,
            }}
          >
            {stageLabel}
          </Text>
        )}
        <Pressable
          onPress={busy ? undefined : handlePublish}
          style={{
            height: 54, borderRadius: 16,
            backgroundColor: busy ? "rgba(230,57,70,0.45)" : "#e63946",
            alignItems: "center", justifyContent: "center",
            flexDirection: "row", gap: 10,
          }}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontFamily: "bold", fontSize: 16 }}>
              Publish Episode
            </Text>
          )}
        </Pressable>
      </View>

      {/* Category picker */}
      <Modal
        visible={categoryVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" }}>
          <Pressable style={{ flex: 1 }} onPress={() => setCategoryVisible(false)} />
          <View
            style={{
              backgroundColor: "#1a1c24",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "65%",
            }}
          >
            <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)" }} />
            </View>
            <Text
              style={{
                color: "#f9fafb", fontFamily: "bold", fontSize: 18,
                paddingHorizontal: 20, paddingVertical: 16,
              }}
            >
              Select Category
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => { setCategory(cat.name); setCategoryVisible(false); }}
                  style={{
                    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                    paddingHorizontal: 20, paddingVertical: 14,
                    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <Text
                    style={{
                      color: category === cat.name ? "#f9fafb" : "#9ca3af",
                      fontFamily: category === cat.name ? "bold" : "regular",
                      fontSize: 15,
                    }}
                  >
                    {cat.name}
                  </Text>
                  {category === cat.name && (
                    <Image style={{ width: 16, height: 16 }} tintColor="#e63946" source={icons.selected} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const labelStyle = {
  color: "#9ca3af",
  fontSize: 12,
  fontFamily: "medium",
  textTransform: "uppercase" as const,
  letterSpacing: 0.8,
};

const inputStyle = {
  backgroundColor: "#1a1c24",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 14,
  color: "#f9fafb",
  fontFamily: "regular",
  fontSize: 15,
};
