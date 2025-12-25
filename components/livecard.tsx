import { View, Text, Image } from 'react-native'
import { useState, useEffect } from 'react'
import { getColors } from 'react-native-image-colors';
import { icons } from '@/constants/icons'
import { images } from '@/constants/image';

let timeClass = 'text-textSecondary font-MonMedium text-sm';
let listenerImageClass = "w-8 h-8 rounded-full -ml-3 border border-2 border-[#4169e19e]"
let imageUri = images.profile2


const Livecard = () => {
    const [dominantColor, setDominantColor] = useState('#ffffff');

  useEffect(() => {
    const extractColor = async () => {
      try {
        const colors = await getColors(imageUri);
        setDominantColor(colors.dominant); // Just the color string
      } catch (error) {
        console.log('Error extracting color:', error);
      }
    };
    
    extractColor();
  }, [imageUri]); // Add imageUri as dependency
  return (
    <View className='flex-1 h-48'>
      <View className='w-full h-full bg-[#4169e19e] rounded-xl p-2'>
        <View className='flex-1 h-1/2 flex flex-row items-start justify-between'>
            <View className='flex flex-1 flex-row items-start justify-start gap-4'>
                <View className='w-20 h-20'>
                    <Image className='w-full h-full' source={images.pod2}></Image>
                </View>
                <View>
                    <Text numberOfLines={1} className='font-MonBold text-textPrimary text-xl'>Holy Fire (Live) radio</Text>
                    <View className='flex-row items-center gap-2'>
                        <Text className={timeClass}>Pod</Text>
                        <Text className={timeClass}>|</Text>
                        <Text className={timeClass}>52:27 mins</Text>
                    </View>
                </View>
            </View>
            <Image source={icons.menu} className='w-7 h-7'></Image>
        </View>
        <View className=' h-12 flex flex-row items-center justify-start gap-2'>
            <View className='flex flex-row items-start justify-start'>
            <Image source={images.profile1} className='w-8 h-8 rounded-full'></Image>
            <Image source={images.profile2} className={listenerImageClass}></Image>
            <Image source={images.profile3} className={listenerImageClass}></Image>
            <Image source={images.profile4} className={listenerImageClass}></Image>
            <Image source={images.profile5} className={listenerImageClass}></Image>
            </View>
            <Text className='text-white font-MonMedium'>+3k <Text className='text-secondary font-MonRegular text-sm'>listening</Text></Text>
        </View>
        <View className='border border-white h-12'>
            
        </View>
      </View>
    </View>
  )
}

export default Livecard