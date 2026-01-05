import { View, Text, Image } from 'react-native'
import React from 'react'

type props = {
  platfrom: string;
  icon: any;
}

const SocialB = ({platfrom, icon}: props) => {
  return (
    <View className="w-full border border-[#363c4d] h-16 bg-[#1f222b] rounded-3xl flex flex-row items-center justify-center gap-4">
        <Image className='w-7 h-7' source={icon}/>
        <Text className='text-lg text-textPrimary font-MonMedium w-fit border border-transparent'>Continue with {platfrom}</Text>
        
    </View>
  );
}

export default SocialB;