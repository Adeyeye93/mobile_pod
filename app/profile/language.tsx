import PageHead from "@/components/PageHead";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "yo", label: "Yorùbá" },
];

export default function LanguageRegion() {
  const [selected, setSelected] = useState("en-US");

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4">
        <PageHead title="Language and Region" />

        <View className="gap-1 mt-2">
          {LANGUAGES.map((lang) => (
            <Pressable
              key={lang.code}
              onPress={() => setSelected(lang.code)}
              className="flex-row items-center justify-between h-14 border-b border-white/5"
            >
              <Text className="text-textPrimary font-MonMedium text-sm">
                {lang.label}
              </Text>
              {selected === lang.code && (
                <Ionicons name="checkmark" size={18} color="#4169e1" />
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
