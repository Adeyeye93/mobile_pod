import { Text, View } from "react-native";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

export default function Index() {
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
    <View className="flex-1 items-center justify-center bg-green-200">
      <Text className="text-5xl font-bold">TYPE SHIT</Text>
    </View>
  );
}
