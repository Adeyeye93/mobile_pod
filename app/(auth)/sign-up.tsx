import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import SocialS from "@/components/auth/SocialS";
import Inputs from "@/components/auth/Inputs";
import { icons } from "@/constants/icons";
import PageHead from "@/components/PageHead";
import { images } from "@/constants/image";
import { useRouter } from "expo-router";
import { useToast } from "@/context/FlashMessageContext";
import { useState } from "react";

export default function SignUp() {
  const { signUp } = useAuth();
  const router = useRouter();
  const { show } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signUp({
        email,
        password,
        password_confirmation: passwordConfirm,
      });
      show({ message: "Account created!", type: "success", title: "Success" });
      // Navigate to next screen or sign in screen
      // router.push("/(app)/home");
    } catch (err: any) {
      if (err.type === "validation") {
        const message = Object.values(err.errors).flat().join("\n");
        show({
          title: "Error",
          message: message,
          type: "danger",
        });
      } else {
        show({
          message: err.message || "Something went wrong",
          type: "danger",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading;

  return (
    <View className="flex-1 bg-background px-4 pb-10">
      <PageHead />
      <View className="flex-1 flex-col items-center justify-end">
        <View className=" w-full h-4/5 flex flex-col items-center justify-between">
          <Image className="w-36 h-36 mb-5" source={images.logo} />
          <Text className="text-textPrimary font-MonBold text-4xl w-full text-center">
            Create Your Account
          </Text>
          <View className="h-fit w-full flex-col items-center justify-center gap-10">
            <Inputs
              placeholder="Email"
              icon={icons.email}
              keyboardType="email-address"
              editable={!isDisabled}
              value={email}
              onChangeText={setEmail}
              pointerEvents={isDisabled ? "none" : "auto"}
              style={{ opacity: isDisabled ? 0.6 : 1 }}
            />
            <Inputs
              placeholder="password"
              icon={icons.passwordKey}
              secureTextEntry
              secret_icon
              editable={!isDisabled}
              value={password}
              onChangeText={setPassword}
              pointerEvents={isDisabled ? "none" : "auto"}
              style={{ opacity: isDisabled ? 0.6 : 1 }}
            />
            <Inputs
              placeholder="Confirm password"
              icon={icons.passwordKey}
              secureTextEntry
              secret_icon
              editable={!isDisabled}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              pointerEvents={isDisabled ? "none" : "auto"}
              style={{ opacity: isDisabled ? 0.6 : 1 }}
            />
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={isDisabled}
              className={`w-full h-16 flex items-center justify-center rounded-full ${
                isDisabled ? "bg-gray-400" : "bg-primary"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator size='small' color="#ffffff" />
              ) : (
                <Text className="text-center text-textPrimary font-MonBold">
                  Sign in with Password
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View className="w-full h-16 flex flex-row items-center justify-between">
          <View className="border-b border-[#c5c5c51e] w-48" />
          <Text className="text-textSecondary font-MonRegular">or</Text>
          <View className="border-b border-[#c5c5c51e] w-48" />
        </View>
        <View className=" w-full h-40 flex items-center justify-around flex-col">
          <View
            className={`w-full h-28 flex-row items-center justify-center gap-7 ${
              isDisabled ? "opacity-50" : ""
            }`}
            pointerEvents={isDisabled ? "none" : "auto"}
          >
            <SocialS icon={icons.google} />
            <SocialS icon={icons.apple} />
          </View>
          <Text className="text-center text-textPrimary font-MonRegular ">
            Alread have an account?{" "}
            <Text
              onPress={() => !isDisabled && router.push("/(auth)/sign-in")}
              className={isDisabled ? "text-gray-400" : "text-primary"}
            >
              Sign in
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
