import { View, Text } from 'react-native'
import React from 'react'
import { useAuth } from '@/context/AuthContext'


const Profile = () => {
  const { signOut } = useAuth() 
  const handleLogOut = () => {
    signOut()
}

  return (
    <View className='flex-1 flex items-center justify-center'>
      <Text onPress={() => handleLogOut()}>Log Out</Text>
    </View>
  )
}

export default Profile