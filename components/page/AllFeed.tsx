import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Image,
  Dimensions,
} from "react-native";
import React from 'react'
import PodList from "@/components/PodList";
import SecondHeader from "@/components/SecondHeader";
import SectionHeader from "@/components/SectionHeader";
import Livecard from "@/components/livecard";
import Subscription from "@/components/subscription";
import { images } from '@/constants/image';


let SectionTopLevelClass = "flex-1 h-fit mt-8";
const { width: SCREEN_WIDTH } = Dimensions.get("window");


const AllFeed = () => {
  return (
    <ScrollView
      className="flex-1"
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 10, minHeight: "100%" }}
    >
      {/* Main Content Goes Here */}
      <ImageBackground
        source={images.banner}
        className="w-full h-48 rounded-[30px] mt-3 overflow-hidden pl-5 flex-row justify-start items-start"
        resizeMode="cover"
      >
        <Image
          source={images.banner1}
          className="absolute top-0 right-0 h-full w-[18rem]"
        />
        <View className="flex w-2/3 mt-10">
          <Text className="text-white font-MonBold text-xl">
            Tune In. Connect. Listen
          </Text>
          <Text className="text-white font-MonRegular text-sm mt-5 w-full">
            Stream live audio from your favorite creators and join the
            conversation today!
          </Text>
        </View>
      </ImageBackground>
      <View className={SectionTopLevelClass}>
        <SectionHeader
          title="Subscriptions"
          action="See All"
          actionRoute="/home/subscriptions"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-5"
        >
          <Subscription />
        </ScrollView>
      </View>
      <View className={SectionTopLevelClass}>
        <SectionHeader
          title="New Updates"
          action="See All"
          actionRoute="/home/New Updates"
        />
        <PodList Playing={false} Completed={false} />
      </View>
      <View className={SectionTopLevelClass}>
        <SecondHeader topic="Becuase you listened to" channel="Ted Talk" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-5"
        >
          <Subscription />
        </ScrollView>
      </View>

      <View className={SectionTopLevelClass}>
        <ScrollView
          horizontal
          snapToInterval={SCREEN_WIDTH * 0.9 + 16}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
        >
          <View style={{ width: SCREEN_WIDTH * 0.9, marginRight: 10 }}>
            <Livecard />
          </View>

          <View style={{ width: SCREEN_WIDTH * 0.9, marginRight: 10 }}>
            <Livecard />
          </View>

          <View style={{ width: SCREEN_WIDTH * 0.9 }}>
            <Livecard />
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

export default AllFeed