import { View, Text, Image } from 'react-native'
import React from 'react'
import { images } from '@/constants/image'

const Sun = ({ image }: any) => {
  return (
    <View className='h-full  w-32 flex flex-col justify-between '>
        
        <View className='w-full h-32 rounded-3xl flex justify-between overflow-hidden self-center'>
        <Image source={image} className='w-full h-full'/>
      </View>
      <View className='w-full mt-1 h-14'>
        <Text className='text-textSecondary font-MonRegular text-xs px-2 capitalize' numberOfLines={1} ellipsizeMode='tail'>was Live 3 min Ago</Text>
        <Text className='text-textPrimary font-MonBold text-xs px-2 capitalize' numberOfLines={2} ellipsizeMode='tail'>Ted Talk</Text>
      </View>
    </View>
  )
}

const Subscription = () => {
  return (
    <View className='w-fit h-full flex flex-row justify-start items-center gap-4'>
        
        <Sun image={images.pod1}/>
        <Sun image={images.pod2}/>
        <Sun image={images.pod3}/>
        <Sun image={images.pod4}/>
        <Sun image={images.pod5}/>
        <Sun image={images.pod6}/>

    </View>
  )
}


export default Subscription