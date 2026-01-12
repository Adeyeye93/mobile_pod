import { View, Text, Pressable, Image } from 'react-native'
import React from 'react'
import { icons } from '@/constants/icons';

const Recent = () => {
  return (
    <View className="w-full flex-row items-center justify-between">
      <Text className="text-[gray] font-MonMedium text-xl">
        Happy People Are Annoying
      </Text>
      <Pressable>
        <Image tintColor="gray" className="w-7 h-7" source={icons.close} />
      </Pressable>
    </View>
  );
}

export default Recent