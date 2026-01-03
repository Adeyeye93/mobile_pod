import { View, Text, TextInput, Pressable } from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function SignUp() {
  const { signUp } = useAuth();

  const handleSignIn = async () => {
    await signUp(["test@email.com", "password", "password"]);
  };

  return (
    <View className="flex-1 px-6 justify-center">
      <Text className="text-2xl font-MonBold mb-6">Sign Up</Text>

      <TextInput placeholder="Email" className="mb-4" />
      <TextInput placeholder="Password" secureTextEntry className="mb-6" />

      <Pressable
        onPress={handleSignIn}
        className="bg-primary py-4 rounded-full"
      >
        <Text className="text-white text-center font-MonBold">Sign Up</Text>
      </Pressable>
    </View>
  );
}
