import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import { images } from '@/constants/image'
import {  } from '@/constants/icons';
import PlayPauseButton from './playPauseButton';
import { useRouter } from 'expo-router';
import PodTitle from './PodTitle';

let timeClass = 'text-textSecondary font-MonRegular text-[11.5px]';
let Comp = ({Playing, Completed}: {Playing: boolean, Completed: boolean}) => {
  const router = useRouter();

  return (
    <View className="w-full h-40 flex flex-row justify-between items-center gap-4">
      <View className="w-40 h-full rounded-[28px] overflow-hidden">
        <Image
          source={images.pod2}
          className="h-full w-full object-cover"
        ></Image>
      </View>
      <View className="flex-1 flex flex-col justify-between items-start  h-full">
        <PodTitle title="654: Deep Dive | How to Quit Your Job the Right Way" />
        <View className="flex-row items-center gap-5">
          <Pressable onPress={() => router.navigate("/home/author/Ted Talk")}>
            <Text className={timeClass}>The Daily</Text>
          </Pressable>
          <Text className={timeClass}>|</Text>
          <Text className={timeClass}>52:27 mins</Text>
        </View>
        <PlayPauseButton Playing={Playing} Completed={Completed} />
      </View>
    </View>
  );
}

const PodList = ({Playing, Completed}: {Playing: boolean, Completed: boolean}) => {
  return (
    <View className='w-full h-fit flex flex-col justify-start items-start mt-5 gap-6'>
      <Comp Playing={Playing} Completed={Completed}/>
      <Comp Playing={Playing} Completed={Completed}/>
      <Comp Playing={Playing} Completed={Completed}/>
    </View>
  )
}

export default PodList