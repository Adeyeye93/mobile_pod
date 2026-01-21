import { View, Text, Image, Pressable } from 'react-native'
import { useState  } from 'react'
import { icons } from '@/constants/icons';
import { images } from '@/constants/image';
type Props = {
    authorDetails?: boolean;
    Description?: string;
    imageUrl?: any;
    title?: string;
    podcastsCount?: string;
  }

const Head = ({ authorDetails, Description, imageUrl, title, podcastsCount }: Props) => {
       const [expanded, setExpanded] = useState(false);
       const [subscribed, setSubscribed] = useState(false);


  return (
    <View className="w-full h-fit flex justify-between items-center flex-col">
      <View className="h-52 w-full flex flex-row items-center justify-between">
        <View className="w-36 h-36 rounded-[20px] overflow-hidden ">
          <Image source={imageUrl} className="h-full w-full object-cover" />
        </View>
        <View className="flex-1 h-40 flex flex-col items-start justify-between p-3">
          <Text
            numberOfLines={1}
            className="text-textPrimary font-MonBold text-xl"
          >
            {title}
          </Text>
          <Text className="text-textSecondary text-sm font-MonRegular">
            {podcastsCount} Podcasts
          </Text>
          <View className="w-full h-16 flex-row items-center justify-start gap-4">
            {authorDetails && (
                <Pressable
              onPress={() => setSubscribed(!subscribed)}
              className={`${
                subscribed
                  ? "w-36 bg-transparent border border-primary"
                  : "w-32 bg-primary"
              } h-10 rounded-full flex flex-row items-center justify-center gap-2`}
            >
              <Image
                source={subscribed ? icons.selected : icons.plus}
                className="h-3 w-3"
                tintColor={subscribed ? "#4169e1" : "#ffffff"}
              />
              <Text
                className={`${
                  subscribed ? "text-primary" : "text-textPrimary"
                } font-MonMedium leading-10`}
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </Text>
            </Pressable>
            )}
            
            <Image source={icons.internet} className="h-6 w-6" />
            <Image source={icons.shareH} className="h-6 w-6" />
          </View>
        </View>
      </View>
      {authorDetails && (
      <Pressable onPress={() => setExpanded(!expanded)}>
        <Text
          numberOfLines={expanded ? 0 : 3}
          className="text-textSecondary text-sm leading-relaxed font-MonRegular"
        >
          {Description}
        </Text>
      </Pressable>)}
    </View>
  );
}

export default Head