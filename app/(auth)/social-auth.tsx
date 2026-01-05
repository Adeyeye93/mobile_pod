import PageHead from "@/components/PageHead";
import { images} from "@/constants/image";
import React from "react";
import { Image, Text, View, TouchableOpacity} from "react-native";
import SocialB from "@/components/auth/social-big";
import { icons } from "@/constants/icons";
import { useRouter } from "expo-router";


const SocialAuth = () => {
    const router = useRouter()
    const andlePass = () => {
      router.push("/(auth)/sign-in");
    };
  return (
    <View className="flex-1 bg-background px-4 pb-28">
      <PageHead />
      <View className="flex-1 flex-col items-center justify-end">
        <View className=" w-full h-3/5 flex flex-col items-center justify-between">
          <Image className="w-36 h-36 mb-5" source={images.logo} />
          <Text className="text-textPrimary font-MonBold text-4xl w-full text-center">
            Let&apos;s you in
          </Text>
          <View className="h-3/6 w-full flex-col items-center justify-center gap-6">
            <SocialB platfrom="Google" icon={icons.google} />
            <SocialB platfrom="Apple" icon={icons.apple} />
          </View>
        </View>
        <View className="w-full h-16 flex flex-row items-center justify-between">
          <View className="border-b border-[#c5c5c51e] w-48" />
          <Text className="text-textSecondary font-MonRegular">or</Text>
          <View className="border-b border-[#c5c5c51e] w-48" />
        </View>
        <View className=" w-full h-40 flex items-center justify-around flex-col">
          <TouchableOpacity
            onPress={andlePass}
            className="w-full h-16 bg-primary flex items-center justify-center rounded-full"
          >
            <Text className="text-center text-textPrimary font-MonBold ">
              Sign in with Password
            </Text>
          </TouchableOpacity>
          <Text className="text-center text-textPrimary font-MonRegular ">
            Don&apos;t have an account?{" "}
            <Text onPress={() => router.push('/(auth)/sign-up')} className="text-primary">Sign Up</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SocialAuth;
