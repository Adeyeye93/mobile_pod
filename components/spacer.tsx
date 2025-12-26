import { View } from 'react-native'
import React from 'react'

const Spacer = ({value}: {value: number}) => {
  return (
    <View style={{
        padding: value
    }}>
    </View>
  )
}

export default Spacer