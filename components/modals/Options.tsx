import { View, Text, Image, Pressable} from 'react-native'
import React from 'react'
import {
  Sheet,
  OptionsSheetContext,
  useOptionsSheet,
} from "@/context/CreateSheetContext"; 
import { icons } from '@/constants/icons';
import Divider from '../divider';



const Options = () => {
const { ref: sheetRef } = useOptionsSheet();
    
  return (
    <Sheet context={OptionsSheetContext} snapPoints={[0.1, 400]}>
      <View className="w-full h-full flex-col items-center justify-start">
        <View className="w-full h-16 flex-row items-center pl-6">
          <Pressable
            onPress={() => sheetRef.current?.close()}
            className="justify-self-end"
          >
            <Image className="w-6 h-6" source={icons.close_modal}></Image>
          </Pressable>
          <Text className="ml-32 text-textSecondary font-MonBold text-xl">
            Options
          </Text>
        </View>
        <View className="flex-1 w-full flex-col items-center justify-start">
          <Pressable className="w-full h-14  flex-row items-center justify-start pl-5 gap-16">
            <Image className="w-6 h-6" source={icons.share} />
            <Text className="text-textSecondary font-MonMedium text-lg">
              Select to do something
            </Text>
          </Pressable>
          <Divider gap={5} value={200} />
          <Pressable className="w-full h-14  flex-row items-center justify-start pl-5 gap-16">
            <Image className="w-6 h-6" source={icons.share} />
            <Text className="text-textSecondary font-MonMedium text-lg">
              Select to do something
            </Text>
          </Pressable>
          <Divider gap={5} value={200} />
          <Pressable className="w-full h-14  flex-row items-center justify-start pl-5 gap-16">
            <Image className="w-6 h-6" source={icons.share} />
            <Text className="text-textSecondary font-MonMedium text-lg">
              Select to do something
            </Text>
          </Pressable>
          <Divider gap={5} value={200} />
          <Pressable className="w-full h-14  flex-row items-center justify-start pl-5 gap-16">
            <Image className="w-6 h-6" source={icons.share} />
            <Text className="text-textSecondary font-MonMedium text-lg">
              Select to do something
            </Text>
          </Pressable>
          <Divider gap={5} value={200} />
          <Pressable className="w-full h-14  flex-row items-center justify-start pl-5 gap-16">
            <Image className="w-6 h-6" source={icons.share} />
            <Text className="text-textSecondary font-MonMedium text-lg">
              Select to do something
            </Text>
          </Pressable>
        </View>
      </View>
    </Sheet>
  );
}

export default Options;

