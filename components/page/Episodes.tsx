import { View, Text } from 'react-native'
import React from 'react'
import PageHead from '../PageHead'

const Episodes = () => {
  return (
    <View className='h-full w-full -mt-10'>
      <PageHead title='Episodes' has_menu has_priv={false}/>
    </View>
  )
}

export default Episodes