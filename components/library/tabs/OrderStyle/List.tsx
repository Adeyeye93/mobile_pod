import { View, Text, Image, Pressable, TouchableOpacity } from 'react-native'
import React from 'react'
import { images } from '@/constants/image'
import { icons } from '@/constants/icons';

const List = () => {
  return (
    <TouchableOpacity className="w-full h-16 flex-row items-center justify-between p-2">
      <View className="flex-1 h-full flex-row items-center justify-start gap-3">
        <Image className="h-14 w-14" source={images.pod5} />
        <View className="flex-1 h-full flex-col items-start justify-evenly">
          <Text
            className="text-textPrimary font-MonBold capitalize"
            numberOfLines={1}
          >
            must be used within its corresponding ModalProvider
          </Text>
          <Text
            className="text-textSecondary font-MonMedium text-xs"
            numberOfLines={1}
          >
            TED TALK
          </Text>
        </View>
      </View>
      <Pressable className="h-full w-10 flex-row items-center justify-center">
        <Image className="w-6 h-6" source={icons.downloaded} />
      </Pressable>
      <Pressable className="h-full w-10 flex-row items-center justify-center">
        <Image className="w-6 h-6" source={icons.menu} />
      </Pressable>
    </TouchableOpacity>
  );
}

export default List