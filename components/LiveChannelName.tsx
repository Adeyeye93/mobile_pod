import { Text } from 'react-native'
import React from 'react'


let channelsArray = ["Ted Talks", "The Daily", "The Sharks"];
const channelLine = channelsArray.join(" • ");
let channels = "text-gray-400 font-MonMedium text-sm";


const LiveChannelName = () => {
  return (
    <Text numberOfLines={1} ellipsizeMode="tail" className={channels}>
      {channelLine}
    </Text>
  );
}

export default LiveChannelName