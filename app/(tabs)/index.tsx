import {
  Text,
  View,
  Image,
  ScrollView,
  Pressable,
  ImageBackground,
  Dimensions,
} 
from "react-native";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { images } from "../../constants/image";
import { icons } from "@/constants/icons";
import Subscription from "@/components/subscription";
import PodList from "@/components/PodList";
import SectionHeader from "@/components/SectionHeader";
import SecondHeader from "@/components/SecondHeader";
import Livecard from "@/components/livecard";
import { PlayerProvider } from "@/context/PlayerContext";
import { useRouter } from "expo-router";



let SectionTopLevelClass = 'flex-1 h-fit mt-8'
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    'bold': require('../../assets/fonts/Montserrat-Bold.ttf'),
    'medium': require('../../assets/fonts/Montserrat-Medium.ttf'),
    'regular': require('../../assets/fonts/Montserrat-Regular.ttf'),
    'thin': require('../../assets/fonts/Montserrat-Thin.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  

  return (
    <PlayerProvider>
      <View className="flex-1 bg-background px-4">
        <View className="w-full p-2 flex flex-row items-center justify-between mt-12">
          <View className="flex flex-row items-center gap-6">
            <Image source={images.profile} className="h-12 w-12 rounded-full" />
            <View>
              <Text className="text-textSecondary font-MonRegular">
                Good Morning
              </Text>
              <Text className="text-textPrimary font-MonBold">
                Andrew Johnson
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() =>
             router.push('/home/notification')
            }
          >
            <Image source={icons.notification} className="w-7 h-7" />
          </Pressable>
        </View>
        <ScrollView
          className="flex-1"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10, minHeight: "100%" }}
        >
          {/* Main Content Goes Here */}
          <ImageBackground
            source={images.banner}
            className="w-full h-48 rounded-[30px] mt-8 overflow-hidden pl-5 flex-row justify-start items-start"
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
            <SectionHeader title="Subscriptions" action="See All" actionRoute="/home/subscriptions" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-5"
            >
              <Subscription />
            </ScrollView>
          </View>
          <View className={SectionTopLevelClass}>
            <SectionHeader title="New Updates" action="See All" actionRoute="/home/New Updates" />
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
      </View>
    </PlayerProvider>
  );
}
