import Divider from "@/components/divider";
import Input from "@/components/form/input";
import PageHead from "@/components/PageHead";
import ProfileList from "@/components/ProfileList";
import { useStream } from "@/context/stream/StreamSetUp";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useCategorySheet, useStreamTimeSheet } from "@/context/CreateSheetContext";
import { api } from "@/libs/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/FlashMessageContext";
import { useRouter } from "expo-router";

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
    private: isPrivate,
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

  const handleSetStream = () => {
    const data = {
      user_id: user?.id, // Replace with actual user ID
      title,
      description,
      is_private: isPrivate,
      category,
      allow_comments: allowComments,
      notify_followers: allow_notify_followers,
      notify_subscribers: allow_notify_subscribers,
      record_stream: saveAudio,
      scheduled_start_time: scheduledTime,
    };
    api.post("/streams/create", data)
      .then((res) => {
        console.log("Stream created successfully", res.data);
        show({
          title: "Stream Scheduled",
          type: "success",
          message: "Stream scheduled successfully",
        });
        reset();
        router.push("/creator-dashboard");
      })
      .catch((err) => {
        console.error("Error creating stream", err);
        // Optionally show an error message to the user
      });
    }

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

  // Usage
  formatScheduledTime("2026-03-25T02:00:00.000Z"); // → "Mar 25 2:00AM"

  return (
    <ScrollView
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, gap: 16, minHeight: "100%" }}
      showsVerticalScrollIndicator={false}
      className="bg-CreatorBG"
    >
      <PageHead title="Schedule" has_menu />
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
        <ProfileList
          text="Add Thumbnail"
          // selected={`${NumberOfInvitedGuest} Invited`}
          // onPress={inviteSheetRef.current?.expand}
        />
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
