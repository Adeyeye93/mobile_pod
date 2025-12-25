import { View, Text, Image, TouchableOpacity, Pressable } from 'react-native'
import React from 'react'
import { images } from '@/constants/image'
import { icons } from '@/constants/icons';

let timeClass = 'text-textSecondary font-MonRegular text-[11.5px]';
let Comp = () => {
    return (
      <View className='w-full h-40 flex flex-row justify-between items-center gap-4'>
        <View className='w-40 h-full rounded-[28px] overflow-hidden'>
          <Image source={images.pod2} className='h-full w-full object-cover' ></Image>
        </View>
        <View className='flex-1 flex flex-col justify-between items-start  h-full'>
          <Text className='text-textPrimary font-MonBold text-xl' numberOfLines={2} ellipsizeMode='tail'>654: Deep Dive | How to Quit Your Job the Right Way</Text>
          <View className='flex-row items-center gap-5'>
            <Text className={timeClass}>The Daily</Text>
            <Text className={timeClass}>|</Text>
            <Text className={timeClass}>52:27 mins</Text>
          </View>
          <View className='w-full h-14  flex flex-row items-center '>
            <View className='flex-1 flex flex-row items-center justify-start gap-4'>
              <TouchableOpacity 
                  onPress={() => console.log('Button Pressed')}
                  className='bg-primary w-24 rounded-full h-10 flex flex-row items-center justify-center gap-2'
                >
                  <Image source={icons.play} className='h-4 w-4' />
                  <Text className='text-white font-MonMedium leading-10'>
                    Play
                  </Text>
                </TouchableOpacity>
                <Pressable onPress={() => console.log('Button Pressed')}>
                  <Image source={icons.podAction} className='h-6 w-6' />
                </Pressable>
                <Pressable onPress={() => console.log('Button Pressed')}>
                  <Image source={icons.download} className='h-6 w-6' />
                </Pressable>
            </View>
            <Image source={icons.menu} className='h-6 w-6'></Image>
          </View>
        </View>
      </View>
    )
}

const PodList = () => {
  return (
    <View className='w-full h-fit flex flex-col justify-start items-start mt-5 gap-6'>
      <Comp />
      <Comp />
      <Comp />
    </View>
  )
}

export default PodList