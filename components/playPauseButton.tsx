import { View, Text, TouchableOpacity, Image, Pressable } from "react-native";
import { useState } from "react";
import { icons } from "@/constants/icons";

const PlayPauseButton = ({Playing, Completed}: {Playing: boolean, Completed: boolean}) => {
  const [isPlaying, setIsPlaying] = useState(Playing);
  const [isCompleted] = useState(Completed);

  const handlePress = () => {
    setIsPlaying(!isPlaying);
    console.log("clciked paused or played");
  };
  
  if (!isCompleted) {
    return (
      <View className="w-full h-14  flex flex-row items-center ">
        <View className="flex-1 flex flex-row items-center justify-start gap-4">
          <TouchableOpacity
            onPress={() => handlePress()}
            className="bg-primary w-24 rounded-full h-10 flex flex-row items-center justify-center gap-2"
          >
            <Image
              source={isPlaying ? icons.pause : icons.play}
              className="h-4 w-4"
            />
            <Text className="text-textPrimary font-MonMedium leading-10">
              {isPlaying ? "Pause" : "Play"}
            </Text>
          </TouchableOpacity>
          <Pressable onPress={() => console.log("Button Pressed")}>
            <Image source={icons.podAction} className="h-6 w-6" />
          </Pressable>
          <Pressable onPress={() => console.log("Button Pressed")}>
            <Image source={icons.download} className="h-6 w-6" />
          </Pressable>
        </View>
        <Image source={icons.menu} className="h-6 w-6"></Image>
      </View>
    );
  } else {
    return (
      <View className="w-full h-14  flex flex-row items-center ">
        <View className="flex-1 flex flex-row items-center justify-start gap-4">
          <TouchableOpacity
            onPress={() => handlePress()}
            className="bg-transparent border border-secondary w-32 rounded-full h-10 flex flex-row items-center justify-center gap-2"
          >
            <Image
              source={isPlaying ? icons.pause : icons.play}
              className="h-4 w-4"
              tintColor='#03c275'
            />
            <Text className="text-secondary font-MonMedium leading-10 text-sm">
              Completed
            </Text>
          </TouchableOpacity>
          <Pressable onPress={() => console.log("Button Pressed")}>
            <Image source={icons.finished} className="h-6 w-6" />
          </Pressable>
          <Pressable onPress={() => console.log("Button Pressed")}>
            <Image source={icons.download} className="h-6 w-6" />
          </Pressable>
        </View>
        <Image source={icons.menu} className="h-6 w-6"></Image>
      </View>
    );
  }
};

export default PlayPauseButton;
