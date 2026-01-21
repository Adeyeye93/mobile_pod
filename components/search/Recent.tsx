import { View, Text, Pressable, Image } from 'react-native'
import React from 'react'
import { icons } from '@/constants/icons';

const Recent = () => {
  return (
    <View className="w-full flex-row items-center justify-between gap-10">
      <View className="flex-1 flex-col items-start gap-3 border-l border-[#6b7280] pl-3">
        <Text
          numberOfLines={1}
          className="text-textSecondary font-MonMedium text-base"
        >
          Happy People Are Annoying ljhwff wf ff wfpw fwf
        </Text>
        <Text
          numberOfLines={1}
          className="text-gray-500 font-MonMedium text-sm"
        >
          Podcast | TED TALK
        </Text>
      </View>

      <View className="flex-row gap-4">
        <Pressable>
          <Image className="w-6 h-6" source={icons.play} />
        </Pressable>
        <Pressable>
          <Image tintColor="#6b7280" className="w-6 h-6" source={icons.close} />
        </Pressable>
      </View>
    </View>
  );
}

export default Recent