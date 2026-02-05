import { Pressable, Image } from 'react-native'
import React from 'react'
import { images } from '@/constants/image'
import { useRouter } from 'expo-router'

const PP = () => {
    const router = useRouter()
  return (
    <Pressable onPress={() => router.push('/profile')}>
        <Image source={images.profile} className="h-9 w-9 rounded-full" />
    </Pressable>
  )
}

export default PP