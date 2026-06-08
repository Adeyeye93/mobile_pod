import PageHead from "@/components/PageHead";
import ProfileList from "@/components/ProfileList";
import Divider from "@/components/divider";
import { icons } from "@/constants/icons";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";

export default function HelpCenter() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4">
        <PageHead title="Help Center" />

        <ProfileList
          icon={icons.error_flash}
          text="FAQ"
          onPress={() => {}}
        />
        <ProfileList
          icon={icons.notification}
          text="Contact Support"
          onPress={() => Linking.openURL("mailto:support@echo.fm")}
        />
        <Divider gap={8} value={370} />
        <ProfileList
          text="Privacy Policy"
          onPress={() => {}}
        />
        <ProfileList
          text="Terms of Service"
          onPress={() => {}}
        />
        <ProfileList
          text="App Version"
          secondText="1.0.0"
        />
      </View>
    </SafeAreaView>
  );
}
