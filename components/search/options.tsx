import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'

type Props = {
    datas: any[],
}

const Options = ({datas}: Props) => {
  return (
    <View className="h-28">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 5,
          gap: 10,
          alignItems: "flex-start",
          flexWrap: "wrap",
          flexDirection: "column",
        }}
      >
        {datas.map((data) => (
          <TouchableOpacity key={data.id} className="py-2 px-3 bg-[#1f222b] rounded-lg border border-[#8080801d]">
            <Text className="text-textSecondary font-MonMedium">{data.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default Options;