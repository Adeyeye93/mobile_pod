import { View, Text } from 'react-native'
import React from 'react'

const SectionHeader = ({ title, action }: { title: string, action: string}) => {
  return (
    <View className="flex flex-row justify-between items-center">
                  <Text className="text-textPrimary font-MonBold text-xl">{title}</Text>
                  <Text className="text-primary font-MonBold text-lg">{action}</Text>
                </View>
  )
}

export default SectionHeader