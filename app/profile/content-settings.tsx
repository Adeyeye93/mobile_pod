import PageHead from "@/components/PageHead";
import ProfileList from "@/components/ProfileList";
import Divider from "@/components/divider";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function ContentSettings() {
  const [explicitContent, setExplicitContent] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [dataWarning, setDataWarning] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4">
        <PageHead title="Content Setting" />

        <ProfileList
          text="Allow Explicit Content"
          toggle
          toggleValue={explicitContent}
          onToggleChange={setExplicitContent}
        />
        <ProfileList
          text="Auto-play Next Episode"
          toggle
          toggleValue={autoPlay}
          onToggleChange={setAutoPlay}
        />
        <Divider gap={8} value={370} />
        <ProfileList
          text="Mobile Data Warning"
          toggle
          toggleValue={dataWarning}
          onToggleChange={setDataWarning}
        />
      </View>
    </SafeAreaView>
  );
}
