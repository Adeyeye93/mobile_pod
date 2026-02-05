import { View, Text, ScrollView, Image, Pressable } from "react-native";
import React from "react";
import { images } from "@/constants/image";
import { icons } from "@/constants/icons";
import { useAudio } from "@/context/AudioPlayerContext";
import List from "./OrderStyle/List";

const ListModal = () => {
  const { status, toggle } = useAudio();

  return (
    <View className="w-full h-full">
      <View className="w-full h-28 p-4 flex-row items-center justify-between px-5">
        <Image className="h-20 w-20" source={images.pod2} />
        <View className="h-full flex-row items-center justify-between gap-4">
          <Pressable>
            <Image className="w-6 h-6" source={icons.download} />
          </Pressable>
          <Pressable>
            <Image className="w-6 h-6" source={icons.filter} />
          </Pressable>
          <Pressable>
            <Image className="w-6 h-6" source={icons.random} />
          </Pressable>
          <Pressable
            onPress={toggle}
            className="bg-primary w-14 h-14 rounded-full items-center justify-center"
          >
            <Image
              source={status.playing ? icons.pause : icons.play}
              className="w-7 h-7"
            />
          </Pressable>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 10,
          paddingBottom: 30,
        }}
      >
        {/* TO DO: Use Modal Content Context to feed in Data to the lists, Content Context already developed */}
        <List />
        <List />
        <List />
        <List />
        <List />
        <List />
        <List />
        <List />
        <List />
        <List />
        <List />
        <List />
      </ScrollView>
    </View>
  );
};

export default ListModal;
