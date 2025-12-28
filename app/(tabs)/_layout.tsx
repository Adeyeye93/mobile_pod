import { View, Text, Image } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { icons } from "../../constants/icons";

const TabIcon = ({ focused, icon, iconH, title }: any) => {
  if (focused) {
    return (
      <View className="flex flex-col items-center justify-center min-w-[70px] min-h-[50px]">
        <Image source={iconH} className="w-7 h-7 " />
        <Text className="text-primary text-[10px] font-MonRegular">
          {title}
        </Text>
      </View>
    );
  } else {
    return (
      <View className="flex flex-col items-center justify-center min-w-[70px] min-h-[50px]">
        <Image source={icon} className="w-7 h-7" />
        <Text className="text-icon text-[10px] font-thin font-MonRegular">
          {title}
        </Text>
      </View>
    );
  }
};

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 85,
          paddingHorizontal: 25,
          backgroundColor: "#181a20",
          borderTopWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        tabBarItemStyle: {
          marginTop: 10,
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={icons.home}
              iconH={icons.homeH}
              title="Home"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          headerShown: false,
          title: "Discover",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={icons.discover}
              iconH={icons.discoverH}
              title="Discover"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          headerShown: false,
          title: "Library",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={icons.library}
              iconH={icons.libraryH}
              title="Library"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={icons.profile}
              iconH={icons.profileH}
              title="Profile"
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
