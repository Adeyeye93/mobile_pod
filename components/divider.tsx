import { View } from 'react-native'
import React from 'react'

const Divider = ({ value, gap }: { value: number, gap: number }) => {
  return (
    <View className="flex items-center justify-center" style={{ width: '100%', marginVertical: gap }}>
      <View className="border-b border-[#c5c5c51e]" style={{ width: value }} />
    </View>
  )
}

export default Divider