import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Share,
} from "react-native";
import PageHead from "@/components/PageHead";
import { useCreatorMode } from "@/context/CreatorModeContext";
import PP from "@/components/author/profile/PP";
import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import Divider from "@/components/divider";
import ProfileList from "@/components/ProfileList";
import { images } from "@/constants/image";

export default function CreatorProfile() {
  const { toggleCreatorMode } = useCreatorMode();
  const { username } = useAuth();

  return (
    <ScrollView className="flex-1 bg-CreatorBG">
      <PageHead
        title="Channel"
        has_menu
        iconsList={[icons.share, icons.redirect2]}
        dropdownList={["Share Channel", "Switch to Listener"]}
        onMenuSelect={(opt) => {
          if (opt === "Share Channel") {
            Share.share({ message: "Check out my channel on Echo!" });
          } else if (opt === "Switch to Listener") {
            toggleCreatorMode();
          }
        }}
      />
      <View className="flex-row items-center justify-between px-4">
        <View className="w-fit h-full flex-row items-center justify-center gap-2">
          <PP size={20}></PP>
          <View className="gap-0">
            <Text className="font-MonRegular text-[#eaeaea6a]">Welcome</Text>
            <Text className="font-MonMedium text-textPrimary text-lg capitalize">
              {username}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={toggleCreatorMode}
          className="bg-[#ffffff13] rounded-full p-1"
        >
          <Image className="w-7 h-7" source={icons.redirect2} />
        </Pressable>
      </View>
      <Divider gap={40} value={250} />
      <View className="px-4">
        <ProfileList text="Channel Settings" icon={images.logo} />
        <Divider gap={0} value={400} />
        <ProfileList text="Audio settings" icon={icons.listening} />
        <Divider gap={0} value={400} />
        <ProfileList text="Your Invites" icon={icons.invites} />
        <Divider gap={40} value={250} />
      </View>
      <View className="w-full h-40 items-center justify-center">
        <View className="w-4/5 bg-[#60a46021] h-36 border border-[#60a46021] rounded-lg items-center justify-center p-10">
          <Text className="text-[#60a460c7] font-MonMedium text-sm text-center ">
            If you have any Question or Suggestion feel free to call at anytime,
            Thank you
          </Text>
          <Text className="text-[#12e6e67c] font-MonMedium text-sm text-center text-pretty">
            Learn more
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
