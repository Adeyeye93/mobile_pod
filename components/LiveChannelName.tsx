import { Text } from 'react-native'
import React from 'react'


let channels = "text-gray-400 font-MonMedium text-sm";

interface LiveChannelNameProps {
  channelNames: string[];
}


const LiveChannelName = ({ channelNames }: LiveChannelNameProps) => {
  const channelLine = channelNames.join(" • ");

  return (
    <Text numberOfLines={1} ellipsizeMode="tail" className={channels}>
      {channelLine}
    </Text>
  );
}

export default LiveChannelName