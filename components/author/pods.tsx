import { View } from 'react-native'
import React from 'react'
import Timer from '@/components/author/timer'
import PlayPauseButton from '../playPauseButton'
import PodTitle from '../PodTitle'

const Pods = () => {
  return (
    <View className='w-full h-fit flex flex-col justify-start items-start gap-2'>
      <Timer />
      <PodTitle title="685: Steve Rambam | The Real Life of a Private Investigator" />
      <PlayPauseButton Playing={false} Completed={false} />
    </View>
  )
}

export default Pods