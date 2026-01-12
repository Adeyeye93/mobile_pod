import { View, Text, Image } from 'react-native'
import React from 'react'
import { icons } from '@/constants/icons'

const SearchHeader = (
    {icon, title}: {icon: any, title: string}
) => {
  return (
    <View className="flex flex-row justify-between items-center mt-8 mb-4">
      <View className="flex flex-row gap-2 items-center">
        <Image className="w-5 h-5" tintColor="gray" source={icon} />
        <Text className='font-MonMedium text-[gray] text-lg'>
            {title}
        </Text>
      </View>
    </View>
  );
}

export default SearchHeader