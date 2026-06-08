import { View, Text, Image } from 'react-native'
import React from 'react'
import Divider from '@/components/divider'

interface Props {
  imageUrl: any;
  title?: string;
  creator?: string;
}

const Banner = ({ imageUrl, title, creator }: Props) => {
  return (
    <View className="w-full h-fit flex items-center justify-start flex-col gap-4">
      <View className="w-full h-fit flex flex-col items-center justify-center">
        <View className="w-[300px] h-[300px] rounded-[30px] flex items-center justify-center mb-2 overflow-hidden">
          <Image source={imageUrl} className="w-full h-full" />
        </View>
        <View className="w-full h-fit flex-col items-center justify-start">
          {title ? (
            <Text
              className="text-textPrimary font-MonBold text-2xl mt-6 text-center"
              numberOfLines={2}
            >
              {title}
            </Text>
          ) : null}
          {creator ? (
            <Text className="text-textSecondary font-MonMedium text-base mt-2 text-center">
              {creator}
            </Text>
          ) : null}
        </View>
      </View>
      <Divider value={390} gap={20} />
    </View>
  );
};

export default Banner