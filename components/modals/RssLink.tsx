import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image
} from "react-native";
import { useState } from "react";
import { icons } from "@/constants/icons";

export default function RssLink() {
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState("");

  const handleSubscribe = () => {
    console.log("Subscribe to:", url);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <Image source={icons.link} className="w-7 h-7" />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-[#1f222b] rounded-t-3xl p-6 pb-8">
            {/* Close button area */}
            <TouchableOpacity
              onPress={() => setVisible(false)}
              className="mb-4"
            >
              <Text className="text-gray-400">✕</Text>
            </TouchableOpacity>

            {/* Title */}
            <Text className="text-white text-2xl font-bold mb-2 font-MonBold">
              Subscribe to a Podcast
            </Text>
            <Text className="text-gray-400 mb-6 font-MonRegular">by RSS Feed</Text>

            {/* Input */}
            <TextInput
              placeholder="https://exampleweb.domain/podcast.xml"
              placeholderTextColor="#666"
              value={url}
              onChangeText={setUrl}
              className="bg-[#2a2a3e] border-2 border-primary rounded-2xl px-4 py-3 text-white mb-6 font-MonRegular"
            />

            {/* Buttons */}
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setVisible(false)}
                className="flex-1 bg-gray-700 rounded-full py-3"
              >
                <Text className="text-white text-center font-MonBold">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubscribe}
                className="flex-1 bg-primary rounded-full py-3"
              >
                <Text className="text-white text-center font-MonBold">
                  Subscribe
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
