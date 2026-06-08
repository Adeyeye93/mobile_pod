import PageHead from "@/components/PageHead";
import ProfileList from "@/components/ProfileList";
import Divider from "@/components/divider";
import { icons } from "@/constants/icons";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function Security() {
  const [biometrics, setBiometrics] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4">
        <PageHead title="Security" />

        <ProfileList
          icon={icons.security}
          text="Change Password"
          onPress={() => {}}
        />
        <Divider gap={8} value={370} />
        <ProfileList
          text="Biometric Login"
          toggle
          toggleValue={biometrics}
          onToggleChange={setBiometrics}
        />
        <ProfileList
          text="Two-Factor Authentication"
          onPress={() => {}}
        />
      </View>
    </SafeAreaView>
  );
}
