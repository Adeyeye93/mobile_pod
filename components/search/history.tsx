import { View, Text, ScrollView, Image} from "react-native";
import React from "react";
import { images } from "@/constants/image";
import { icons } from "@/constants/icons";

const History = () => {
  return (
    <View className="h-56">
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 5,
          gap: 10,
        }}
      >
        <View className="w-full h-24 flex-row items-center justify-between">
          <View className="flex-row h-full items-center gap-4">
            <Image className="h-full w-24" source={images.pod4} />
            <View>
              <Text className="font-MonMedium text-textSecondary">
                Conquest of Paradise
              </Text>
              <Text className="font-MonMedium text-[gray] text-sm">
                Vangelise
              </Text>
            </View>
          </View>
          <Image className="w-5 h-5" source={icons.menu} />
        </View>
        <View className="w-full h-24 flex-row items-center justify-between">
          <View className="flex-row h-full items-center gap-4">
            <Image className="h-full w-24" source={images.pod4} />
            <View>
              <Text className="font-MonMedium text-textSecondary">
                Conquest of Paradise
              </Text>
              <Text className="font-MonMedium text-[gray] text-sm">
                Vangelise
              </Text>
            </View>
          </View>
          <Image className="w-5 h-5" source={icons.menu} />
        </View>
        <View className="w-full h-24 flex-row items-center justify-between">
          <View className="flex-row h-full items-center gap-4">
            <Image className="h-full w-24" source={images.pod4} />
            <View>
              <Text className="font-MonMedium text-textSecondary">
                Conquest of Paradise
              </Text>
              <Text className="font-MonMedium text-[gray] text-sm">
                Vangelise
              </Text>
            </View>
          </View>
          <Image className="w-5 h-5" source={icons.menu} />
        </View>
      </ScrollView>
    </View>
  );
};

export default History;
