import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import { useCreatorMode } from "@/context/CreatorModeContext";

export default function CreatorProfile() {
  const { toggleCreatorMode } = useCreatorMode();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6">
        <Text className="text-textPrimary font-MonBold text-3xl mb-6">
          Channel Settings
        </Text>

        {/* Profile picture */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-primary justify-center items-center mb-4">
            <Text className="text-4xl">👤</Text>
          </View>
          <Pressable className="bg-gray-800 px-6 py-2 rounded-lg">
            <Text className="text-textPrimary font-MonMedium">
              Change Avatar
            </Text>
          </Pressable>
        </View>

        {/* Channel Name */}
        <View className="bg-gray-800 p-4 rounded-lg mb-4">
          <Text className="text-textSecondary text-sm mb-2 font-MonBold">
            Channel Name
          </Text>
          <TextInput
            placeholder="My Creator Channel"
            placeholderTextColor="#999"
            className="bg-gray-700 p-3 rounded text-textPrimary"
          />
        </View>

        {/* Bio */}
        <View className="bg-gray-800 p-4 rounded-lg mb-4">
          <Text className="text-textSecondary text-sm mb-2 font-MonBold">
            Bio
          </Text>
          <TextInput
            placeholder="Tell your audience about yourself..."
            placeholderTextColor="#999"
            className="bg-gray-700 p-3 rounded text-textPrimary h-24"
            multiline
          />
        </View>

        {/* Social Links */}
        <View className="bg-gray-800 p-4 rounded-lg mb-4">
          <Text className="text-textSecondary text-sm mb-3 font-MonBold">
            Social Links
          </Text>
          <TextInput
            placeholder="Twitter handle..."
            placeholderTextColor="#999"
            className="bg-gray-700 p-3 rounded text-textPrimary mb-2"
          />
          <TextInput
            placeholder="Instagram profile..."
            placeholderTextColor="#999"
            className="bg-gray-700 p-3 rounded text-textPrimary"
          />
        </View>

        {/* Channel Stats */}
        <View className="bg-gradient-to-r from-primary/20 to-blue-600/20 p-4 rounded-lg mb-6">
          <Text className="text-textPrimary font-MonBold mb-4">
            Channel Stats
          </Text>
          <View className="flex-row justify-between mb-3">
            <View>
              <Text className="text-textSecondary text-sm">
                Total Followers
              </Text>
              <Text className="text-primary font-MonBold text-lg">12,543</Text>
            </View>
            <View>
              <Text className="text-textSecondary text-sm">Total Streams</Text>
              <Text className="text-primary font-MonBold text-lg">42</Text>
            </View>
            <View>
              <Text className="text-textSecondary text-sm">Total Earnings</Text>
              <Text className="text-primary font-MonBold text-lg">$8,420</Text>
            </View>
          </View>
        </View>

        {/* Save button */}
        <Pressable className="bg-primary p-4 rounded-lg mb-6 active:opacity-80">
          <Text className="text-white font-MonBold text-center">
            Save Changes
          </Text>
        </Pressable>

        {/* Divider */}
        <View className="h-px bg-gray-700 mb-6" />

        {/* Switch back to user mode */}
        <Text className="text-textSecondary text-sm mb-4 font-MonBold">
          CREATOR MODE
        </Text>
        <View className="bg-gray-800 p-4 rounded-lg mb-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-textPrimary font-MonBold">
              Switch to User Mode
            </Text>
            <Text className="text-textSecondary text-xs mt-1">
              Go back to regular browsing
            </Text>
          </View>
        </View>

        <Pressable
          onPress={toggleCreatorMode}
          className="bg-red-600/20 border border-red-600 p-4 rounded-lg active:opacity-80"
        >
          <Text className="text-red-500 font-MonBold text-center">
            Exit Creator Mode
          </Text>
        </Pressable>

        <View className="h-6" />
      </View>
    </ScrollView>
  );
}
