import { View, Text, Button } from 'react-native'
import React from 'react'
import PageHead from '@/components/PageHead'
import Banner from '@/components/author/podcast/Banner'
import { audioFiles } from '@/constants/audio'
import { images } from '@/constants/image'
import PodcastPlayer from '@/components/author/podcast/PodcastPlayer'
import { LinearGradient } from "expo-linear-gradient";
import { useImageColors } from "@/hook/useImageColors";


const audio = audioFiles.audio1;

const Player = () => {
  const bannerImage = images.pod;

      const colors = useImageColors(bannerImage);


  return (
    <View className="flex-1 bg-background px-4">
      <View
        className="absolute top-0 h-full left-0 right-0 z-0 flex flex-col items-end justify-end overflow-hidden"
        style={{ backgroundColor: colors?.colorThree.value }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(24,26,32,0.5)", "rgba(24,26,32,1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="w-full h-full"
        />
      </View>
      <PageHead title="Episode 685: Understanding the Future of Tech with Jane Doe" />
      <View className="w-full h-fit flex-col items-center justify-start">
        <Banner imageUrl={bannerImage}/>
      </View>
      <PodcastPlayer audioSource={audio} />
    </View>
  );


}

export default Player;