import { View, Text, Image } from 'react-native'
import React from 'react'
import { images } from '@/constants/image';
import { icons } from '@/constants/icons';

const ChannelList = () => {
  return (
    <View className="flex flex-row items-center justify-between overflow-hidden h-28">
      <View className="w-28 h-28">
        <Image source={images.pod4} className="w-full h-full object-cover" />
      </View>
      <View className="flex-1 mx-5  h-full flex flex-col justify-center items-start">
        <Text
          numberOfLines={1}
          className="text-textPrimary font-MonBold text-lg"
        >
          Podcasts Save America
        </Text>
        <Text className="text-textSecondary font-MonRegular mt-2 text-sm">
          685 Podcasts
        </Text>
      </View>
      <Image source={icons.menu} className="w-7 h-7" />
    </View>
  );
}

export default ChannelList