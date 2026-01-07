// app/auth/interests.tsx
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useInterest } from "@/context/InterestContext";
import { useAuth } from "@/context/AuthContext";
import { icons } from "@/constants/icons";
import { useToast } from "@/context/FlashMessageContext";


export default function SelectInterests() {
  const router = useRouter();
  const { show } = useToast()
  const { user, isAuthenticated } = useAuth();
  const {
    interests,
    selectedInterestIds,
    loadInterests,
    toggleInterest,
    saveUserInterests,
  } = useInterest();

  useEffect(() => {
    if (!isAuthenticated) {
       router.replace("/(auth)/sign-in")
    }
    loadInterests();
  }, []);

  const handleContinue = async () => {
    if (selectedInterestIds.length > 0 && user) {
      await saveUserInterests(user.id);
      show({
        message: "Interests saved!",
        type: "success",
        title: "Success",
      });
      router.replace("/(tabs)");
    }
  }; 

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-white text-2xl font-MonBold mb-4 mt-16">
        What are your interests?
      </Text>
      <Text className="text-white text-base font-MonRegular">
        Choose your interests and get the best podcast recommendations.
      </Text>
      <Text className="text-white text-base font-MonRegular mb-10">
        Dont worry you can always change it latter
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} className="pb-5">
        <View className="flex-row flex-wrap gap-6">
          {interests.map((interest) => (
            <TouchableOpacity
              key={interest.id}
              onPress={() => toggleInterest(interest.id)}
              className={`px-4 py-2 rounded-full border-2 flex-row items-center gap-4 ${
                selectedInterestIds.includes(interest.id)
                  ? "border-primary bg-primary"
                  : "border-gray-600 bg-transparent"
              }`}
            >
              <Text
                className={`text-base font-MonMedium  ${
                  selectedInterestIds.includes(interest.id)
                    ? "text-white"
                    : "text-gray-300"
                }`}
              >
                {interest.name}
              </Text>
              {selectedInterestIds.includes(interest.id) ? (
                <Image
                  tintColor="#fff"
                  source={icons.minus}
                  className="w-5 h-5"
                />
              ) : (
                <Image
                  tintColor="#fff"
                  source={icons.plus}
                  className="w-5 h-5"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={handleContinue}
        disabled={selectedInterestIds.length === 0}
        className="mt-6 bg-primary py-3 rounded-full disabled:opacity-50"
      >
        <Text className="text-white text-center font-MonBold">Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
