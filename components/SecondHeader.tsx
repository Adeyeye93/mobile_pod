import { View, Text, Image } from 'react-native'
import React from 'react'
import { images } from '@/constants/image'

const SecondHeader = ({topic, channel}: any) => {
  return (
    <View className='flex flex-1 flex-row items-center justify-start gap-5'>
        <View className='w-14 h-14 rounded-[15px] overflow-hidden'>
            <Image source={images.pod1} className='w-full h-full'></Image>
        </View>
        <View className='flex-1 h-full flex flex-col items-start justify-between py-1'>
            <Text className='text-textSecondary font-MonRegular text-sm'>{topic}</Text>
            <Text numberOfLines={1} className='text-textPrimary font-MonBold text-2xl'>{channel}</Text>
        </View>
    </View>
  )
}

export default SecondHeader