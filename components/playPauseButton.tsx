import { View, Text, TouchableOpacity, Image, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { icons } from "@/constants/icons";
import DropdownWrapper from "./dropdown";

const PlayPauseButton = ({
  Playing,
  Completed,
  onPlay,
}: {
  Playing: boolean;
  Completed: boolean;
  onPlay?: () => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(Playing);
  const [isCompleted] = useState(Completed);

  // Sync display state when the parent drives the playing flag
  useEffect(() => {
    setIsPlaying(Playing);
  }, [Playing]);

  const handlePress = () => {
    if (onPlay) {
      onPlay();
    } else {
      setIsPlaying((p) => !p);
    }
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
        <DropdownWrapper
          options={["Share", "Mark as Done"]}
          iconPaths={[icons.share, icons.markAsDone]}
          onSelect={(value) => console.log(value)}
        >
          <Image source={icons.menu} className="h-6 w-6"></Image>
        </DropdownWrapper>
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
              tintColor="#03c275"
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
        <DropdownWrapper
          options={["Share", "Mark as Done"]}
          iconPaths={[icons.share, icons.markAsDone]}
          onSelect={(value) => console.log(value)}
        >
          <Image source={icons.menu} className="h-6 w-6"></Image>
        </DropdownWrapper>
      </View>
    );
  }
};

export default PlayPauseButton;
