import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { images } from "@/constants/image";
import { useImageColors } from "@/hook/useImageColors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

console.log("API:", process.env.EXPO_PUBLIC_API_URL);

const onboardingData = [
  {
    id: 1,
    title: "Live Voices, Real Time",
    description:
      "Listen to live audio conversations, shows, and streams as they happen — no waiting, no replays.",
    image: images.slide1,
  },
  {
    id: 2,
    title: "Audio, Without Distractions",
    description:
      "Experience live streams the audio-first way. Stay focused, stay present, wherever you are.",
    image: images.slide2,
  },
  {
    id: 3,
    title: "Go Live From Anywhere",
    description:
      "Host live audio sessions or stream instantly. Your voice, your audience, in real time.",
    image: images.slide3,
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  const direction = useSharedValue(1); // 1 = next, -1 = back
  const imageX = useSharedValue(0);
  const imageOpacity = useSharedValue(1);

  const bgOpacity = useSharedValue(1);
  const textY = useSharedValue(0);
  const textOpacity = useSharedValue(1);

  const slide = onboardingData[currentSlide];

  const bannerImage = slide.image;

  const colors = useImageColors(bannerImage);

  // Create player once with first video

 const animateSlideChange = (dir: 1 | -1, nextIndex: number) => {
   direction.value = dir;

   imageX.value = dir * 40;
   imageOpacity.value = 0;
   textY.value = 8;
   textOpacity.value = 0;
   bgOpacity.value = 0;

   setCurrentSlide(nextIndex);

   imageX.value = withTiming(0, { duration: 400 });
   imageOpacity.value = withTiming(1, { duration: 400 });
   textY.value = withTiming(0, { duration: 350 });
   textOpacity.value = withTiming(1, { duration: 350 });
   bgOpacity.value = withTiming(1, { duration: 450 });
 };

 const goToNextSlide = () => {
   if (currentSlide === onboardingData.length - 1) {
     router.replace("/(auth)/social-auth");
   } else {
     animateSlideChange(1, currentSlide + 1);
   }
 };

 const goToPrevSlide = () => {
   if (currentSlide > 0) {
     animateSlideChange(-1, currentSlide - 1);
   }
 };

 const imageStyle = useAnimatedStyle(() => ({
   transform: [{ translateX: imageX.value }],
   opacity: imageOpacity.value,
 }));


 const textStyle = useAnimatedStyle(() => ({
   transform: [{ translateY: textY.value }],
   opacity: textOpacity.value,
 }));


  const skipOnboarding = () => {
    router.replace("/(auth)/social-auth");
  };

  return (
    <View
      className="flex-1 h-full w-full flex-col items-center justify-start"
      style={{ backgroundColor: colors?.colorThree.value }}
    >
      <View className="w-full h-3/5 flex flex-row items-end justify-center">
        <TouchableOpacity
          onPress={skipOnboarding}
          className="self-end mt-4 absolute z-50 top-14 right-10"
        >
          <Text className="text-textPrimary text-base font-MonMedium">
            Skip
          </Text>
        </TouchableOpacity>
        <Animated.Image
          style={imageStyle}
          className="w-5/6 h-5/6"
          source={slide.image}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(24,26,32,0.5)", "rgba(24,26,32,1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="w-full h-full absolute inset-0"
        />
      </View>

      {/* Content */}
      <View className="flex justify-between p-6  h-2/5 w-full bg-background">
        {/* Text Content */}
        <Animated.View className="flex-1 justify-center" style={textStyle}>
          <Text className="text-textPrimary text-4xl font-MonBold mb-4 text-center">
            {slide.title}
          </Text>
          <Text className="text-textSecondary text-lg font-MonRegular leading-6 text-center">
            {slide.description}
          </Text>
        </Animated.View>

        {/* Pagination Dots */}
        <View className="flex-row justify-center gap-2 mb-8">
          {onboardingData.map((_, index) => (
            <View
              key={index}
              className={`rounded-full ${
                index === currentSlide
                  ? "bg-primary w-8 h-2"
                  : "bg-gray-600 w-2 h-2"
              }`}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row justify-between items-center gap-4">
          <TouchableOpacity
            onPress={goToPrevSlide}
            disabled={currentSlide === 0}
            className={`flex-1 py-3 rounded-full border border-white ${
              currentSlide === 0 ? "hidden" : "opacity-100"
            }`}
          >
            <Text className="text-white text-center font-MonMedium">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToNextSlide}
            className="flex-1 py-3 bg-primary rounded-full"
          >
            <Text className="text-white text-center font-MonBold">
              {currentSlide === onboardingData.length - 1
                ? "Get Started"
                : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
