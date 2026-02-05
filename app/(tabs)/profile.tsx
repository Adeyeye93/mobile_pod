import { View, Text, Image, Pressable, Switch } from "react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/author/profile/header";
import PageHead from "@/components/PageHead";
import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import ProfileList from "@/components/ProfileList";
import Spacer from "@/components/spacer";
import { useCreatorMode } from "@/context/CreatorModeContext";
import { useRouter } from "expo-router";
import { useCreatorWelcomeModal } from "@/context/ModalIntances";
import { api } from "@/libs/api";

const Profile = () => {
  const { signOut, user } = useAuth();
  const { toggleCreatorMode, setAm_a_creator } = useCreatorMode();
  const router = useRouter();
  const { open, close } = useCreatorWelcomeModal();

  const handleLogOut = () => {
    signOut();
  };

  const handleMode = async () => {
    open();
    try {
      const creator = await api.get(`set_am_a_creator/${user?.id}`);
      console.log(creator)
      setTimeout(() => {
      close();
      router.replace("/(tabs)/creator-dashboard");
      toggleCreatorMode();
    }, 5000);
    } catch (error) {
      console.log(error)
    }
    
  };

  return (
    <View className="flex-1 bg-background px-4 pb-16">
      <PageHead title="Profile" has_menu premium />
      <Header />
      <Pressable
        onPress={() => handleMode()}
        className="border border-[#80808025] w-full h-12 rounded-lg mt-5 flex-row items-center justify-between px-2"
      >
        <View className="h-full w-fit flex-row items-center gap-2">
          <View className="h-full w-fit flex-row items-center gap-1">
            <Image tintColor="#ffff" className="w-5 h-5" source={images.logo} />
            <Text className="font-MonBold text-textSecondary text-xs">
              POD FOR
            </Text>
          </View>
          <Text className="font-MonMedium text-primary text-sm">Creator</Text>
        </View>
        <Image tintColor="gray" className="w-5 h-5" source={icons.redirect2} />
      </Pressable>
      <Spacer value={10} />
      <ProfileList icon={icons.profile} text="Edit Profile" />
      <ProfileList icon={icons.notification} text="Notification" />
      <ProfileList icon={icons.download} text="Download" />
      <ProfileList icon={icons.contentSetting} text="Content Setting" />
      <ProfileList icon={icons.security} text="Security" />
      <ProfileList
        icon={icons.langauge}
        text="Langauge and Region"
        secondText="English(US)"
      />
      <ProfileList onPress={handleLogOut} icon={icons.logOut} text="Log out" />
      <ProfileList icon={icons.error_flash} text="Help Center" />
    </View>
  );
};

export default Profile;
