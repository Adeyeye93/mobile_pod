import React, { useEffect } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { CreatorWelcomeModal } from "@/context/ModalIntances";
import { images } from "@/constants/image";
import { animationsFile } from "@/constants/animation";

const CreatorWelcome = () => {
   const opacity = useSharedValue(0);
   const translateY = useSharedValue(20);

   useEffect(() => {
     // Animate in
     opacity.value = withTiming(1, {
       duration: 800,
       easing: Easing.out(Easing.ease),
     });

     translateY.value = withTiming(0, {
       duration: 800,
       easing: Easing.out(Easing.ease),
     });
   }, []);

   const contentStyle = useAnimatedStyle(() => ({
     opacity: opacity.value,
     transform: [{ translateY: translateY.value }],
   }));
   
  return (
    <View>
      <CreatorWelcomeModal
        showCloseButton={false}
        title=""
        animationType="fade"
        backgroundColor="#1a1a2e"
      >
        <View className="flex-1 bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1e] justify-between px-6 py-12">
          {/* Main content */}
          <Animated.View
            style={contentStyle}
            className="flex-1 justify-center items-center"
          >
            {/* App title */}
            <Text className="text-primary font-MonBold text-3xl mb-8 tracking-wider">
              WELCOME
            </Text>

            {/* Hero Image - Microphone/Podcast themed */}
            <Image
              source={images.slide2} // Replace with your podcast image
              style={{
                width: 500,
                height: 500,
                resizeMode: "contain",
                marginBottom: 40,
              }}
            />
          </Animated.View>

          {/* Bottom section */}
          <Animated.View style={contentStyle}>
            {/* Headline */}
            <Text className="text-white font-MonBold text-4xl mb-4 leading-tight">
              Your Voice, Live
            </Text>

            {/* Description */}
            <Text className="text-textSecondary font-MonRegular text-base mb-8 leading-relaxed">
              Stream live audio, connect with listeners, and build your podcast
              community in real time.
            </Text>

            {/* Action buttons */}
            <View className="flex-row">
              {/* Primary button */}
              <View className="flex-row items-center">
                <LottieView
                  source={animationsFile.preloader}
                  autoPlay
                  loop={true}
                  speed={2}
                  style={{
                    height: 120,
                    width: 120,
                    padding: 0,
                  }}
                />
                <Text className="text-white font-MonBold">Organizing your data...</Text>
              </View>
            </View>

            {/* Audio wave visualizer lines (decorative) */}
            <View className="absolute -top-[10rem] left-6 flex-row gap-1">
              {[1, 2, 3, 4, 5].map((line) => (
                <View
                  key={line}
                  className="w-1 bg-primary rounded"
                  style={{
                    height: 10 + Math.random() * 20,
                    opacity: 0.6,
                  }}
                />
              ))}
            </View>

            <View className="absolute -top-[10rem] right-6 flex-row gap-1">
              {[1, 2, 3, 4, 5].map((line) => (
                <View
                  key={line}
                  className="w-1 bg-primary rounded"
                  style={{
                    height: 10 + Math.random() * 20,
                    opacity: 0.6,
                  }}
                />
              ))}
            </View>
          </Animated.View>
        </View>
      </CreatorWelcomeModal>
    </View>
  );
};

export default CreatorWelcome;
