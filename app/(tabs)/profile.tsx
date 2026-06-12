import { View, Text, Image, Pressable } from "react-native";
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
import { useLogoutSheet } from "@/context/CreateSheetContext";
import { api } from "@/libs/api";
import { shareChannel } from "@/utils/share";

const Profile = () => {
  const { user, username, avatarUrl } = useAuth();
  const { toggleCreatorMode } = useCreatorMode();
  const router = useRouter();
  const { open, close } = useCreatorWelcomeModal();
  const { ref: logoutSheetRef } = useLogoutSheet();

  const handleMode = async () => {
    open();
    try {
      await api.get(`set_am_a_creator/${user?.id}`);
      setTimeout(() => {
        close();
        router.replace("/(tabs)/creator-dashboard");
        toggleCreatorMode();
      }, 5000);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View className="flex-1 bg-background px-4 pb-16">
      <PageHead
        title="Profile"
        has_menu
        premium
        iconsList={[icons.share, icons.report]}
        dropdownList={["Share Profile", "Report a Problem"]}
        onMenuSelect={(opt) => {
          if (opt === "Share Profile") {
            shareChannel(String(user?.id ?? ""), username || "my profile");
          } else if (opt === "Report a Problem") {
            router.push("/profile/help");
          }
        }}
      />
      <Header username={username} avatarUrl={avatarUrl} Sub={0} />

      {/* Creator mode banner */}
      <Pressable
        onPress={handleMode}
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

      <ProfileList
        icon={icons.profile}
        text="Edit Profile"
        onPress={() => router.push("/profile/edit")}
      />
      <ProfileList
        icon={icons.notification}
        text="Notification"
        onPress={() => router.push("/home/notification")}
      />
      <ProfileList
        icon={icons.download}
        text="Download"
        onPress={() => router.push("/profile/downloads")}
      />
      <ProfileList
        icon={icons.contentSetting}
        text="Content Setting"
        onPress={() => router.push("/profile/content-settings")}
      />
      <ProfileList
        icon={icons.security}
        text="Security"
        onPress={() => router.push("/profile/security")}
      />
      <ProfileList
        icon={icons.langauge}
        text="Langauge and Region"
        secondText="English(US)"
        onPress={() => router.push("/profile/language")}
      />
      <ProfileList
        onPress={() => logoutSheetRef.current?.snapToIndex(1)}
        icon={icons.logOut}
        text="Log out"
      />
      <ProfileList
        icon={icons.error_flash}
        text="Help Center"
        onPress={() => router.push("/profile/help")}
      />
    </View>
  );
};

export default Profile;
