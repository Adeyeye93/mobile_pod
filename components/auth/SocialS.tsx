import { View, Image } from 'react-native'
import React from 'react'

const SocialS = ({icon}: any) => {
  return (
    <View className="w-20 border border-[#363c4d] h-16 bg-[#1f222b] rounded-xl flex flex-row items-center justify-center">
            <Image className='w-7 h-7' source={icon}/>
    </View>
  )
}

export default SocialS