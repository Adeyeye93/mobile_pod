import Divider from "@/components/divider";
import Input from "@/components/form/input";
import PageHead from "@/components/PageHead";
import ProfileList from "@/components/ProfileList";
import { useStream } from "@/context/stream/StreamSetUp";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useCategorySheet, useStreamTimeSheet } from "@/context/CreateSheetContext";
import { api } from "@/libs/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/FlashMessageContext";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { icons } from "@/constants/icons";

const Schedule = () => {
  const { ref: categorySheetRef } = useCategorySheet();
  const { ref: timeSheetRef } = useStreamTimeSheet();
  const { show } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const {
    title,
    setTitle,
    reset,
    isPrivate,
    setPrivate,
    description,
    setDescription,
    category,
    allowComments,
    setAllowComments,
    allow_notify_followers,
    setAllowNotifyFollowers,
    allow_notify_subscribers,
    setAllowNotifySubscribers,
    saveAudio,
    setSaveAudio,
    scheduledTime,
  } = useStream();

  const [thumbnailLocalUri, setThumbnailLocalUri] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  // ── Thumbnail: pick → presign → PUT to S3 ─────────────────────────────────
  const handlePickThumbnail = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      show({
        title: "Permission denied",
        message: "Camera roll access is needed to add a thumbnail.",
        type: "danger",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: true,
      aspect: [16, 9],
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const contentType = asset.mimeType ?? "image/jpeg";

    setIsUploadingThumbnail(true);
    try {
      // Step 1 — get presigned S3 upload URL
      const presignRes = await api.post("/uploads/thumbnail_presign", {
        content_type: contentType,
      });
      const { upload_url, thumbnail_url } = presignRes.data;

      // Step 2 — PUT raw bytes directly to S3 (no auth header)
      const imageRes = await fetch(asset.uri);
      const blob = await imageRes.blob();
      const s3Res = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: blob,
      });

      if (!s3Res.ok) throw new Error(`S3 upload failed: ${s3Res.status}`);

      // Step 3 — store the CDN URL for use in stream create
      setThumbnailLocalUri(asset.uri);
      setThumbnailUrl(thumbnail_url);
      show({ title: "Thumbnail added", message: "", type: "success" });
    } catch (err) {
      console.error("Thumbnail upload failed:", err);
      show({
        title: "Upload failed",
        message: "Could not upload thumbnail. Please try again.",
        type: "danger",
      });
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  // ── Stream create ──────────────────────────────────────────────────────────
  const handleSetStream = () => {
    const data = {
      user_id: user?.id,
      title,
      description,
      is_private: isPrivate,
      category,
      allow_comments: allowComments,
      notify_followers: allow_notify_followers,
      notify_subscribers: allow_notify_subscribers,
      record_stream: saveAudio,
      scheduled_start_time: scheduledTime,
      ...(thumbnailUrl ? { thumbnail: thumbnailUrl } : {}),
    };

    api
      .post("/streams/create", data)
      .then(() => {
        show({
          title: "Stream Scheduled",
          type: "success",
          message: "Stream scheduled successfully",
        });
        reset();
        setThumbnailLocalUri(null);
        setThumbnailUrl(null);
        router.push("/creator-dashboard");
      })
      .catch((err) => {
        console.error("Error creating stream", err);
        show({
          title: "Error",
          message: "Could not schedule stream. Please try again.",
          type: "danger",
        });
      });
  };

  const formatScheduledTime = (isoString: string): string => {
    const date = new Date(isoString);
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, "0");
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${month} ${day} ${displayHour}:${minute}${period}`;
  };

  const STime = scheduledTime ? formatScheduledTime(scheduledTime) : "Not Set";

  return (
    <ScrollView
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, gap: 16, minHeight: "100%" }}
      showsVerticalScrollIndicator={false}
      className="bg-CreatorBG"
    >
      <PageHead
        title="Schedule"
        has_menu
        iconsList={[icons.save, icons.close]}
        dropdownList={["Save Draft", "Discard"]}
        onMenuSelect={(opt) => {
          if (opt === "Discard") {
            reset();
            router.back();
          }
        }}
      />
      <View className="flex flex-col w-full h-fit">
        <View className="w-full flex-col items-center justify-center gap-3">
          <Input
            placeholder="Enter Title"
            label="Stream Title"
            value={title}
            onChangeText={setTitle}
          />
          <Input
            placeholder="Enter Description"
            label="Stream Description"
            textArea
            value={description}
            onChangeText={setDescription}
          />
        </View>
        <Divider gap={10} value={370} />
        <View>
          <ProfileList
            text="Category"
            selected={category}
            onPress={() => {
              categorySheetRef.current?.expand();
            }}
          />
          <ProfileList
            text="Start Time"
            selected={STime}
            onPress={timeSheetRef.current?.expand}
          />
        </View>
        <Divider gap={10} value={370} />
        <ProfileList
          text="Private Stream"
          toggle
          toggleValue={isPrivate}
          onToggleChange={(value) => setPrivate(value)}
        />
        <ProfileList
          text="Allow Comments"
          toggle
          toggleValue={allowComments}
          onToggleChange={(value) => setAllowComments(value)}
        />
        <ProfileList
          text="Save Stream Audio"
          toggle
          toggleValue={saveAudio}
          onToggleChange={(value) => setSaveAudio(value)}
        />
      </View>
      <Divider gap={1} value={370} />
      <View>
        {/* Thumbnail row — custom to show image preview */}
        <Pressable
          onPress={isUploadingThumbnail ? undefined : handlePickThumbnail}
          className="w-full h-14 flex-row items-center justify-between"
        >
          <Text className="text-textPrimary font-MonBold">Add Thumbnail</Text>
          <View className="flex-row items-center gap-3">
            {isUploadingThumbnail ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : thumbnailLocalUri ? (
              <Image
                source={{ uri: thumbnailLocalUri }}
                style={{ width: 52, height: 30, borderRadius: 4 }}
              />
            ) : (
              <Image source={icons.redirect2} className="w-5 h-5" />
            )}
          </View>
        </Pressable>
        <ProfileList
          text="Notify Followers"
          toggle
          toggleValue={allow_notify_followers}
          onToggleChange={(value) => setAllowNotifyFollowers(value)}
        />
        <ProfileList
          text="Notify Subscribers"
          toggle
          toggleValue={allow_notify_subscribers}
          onToggleChange={(value) => setAllowNotifySubscribers(value)}
        />
      </View>
      <Pressable
        onPress={handleSetStream}
        className="w-full h-12 flex items-center justify-center bg-primary rounded-2xl"
      >
        <Text className="text-textPrimary font-MonBold">Start</Text>
      </Pressable>
    </ScrollView>
  );
};

export default Schedule;
