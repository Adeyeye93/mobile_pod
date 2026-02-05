import { Tabs } from "expo-router";
import { View, Text, Image } from "react-native";
import { icons } from "@/constants/icons";
import { useCreatorMode } from "@/context/CreatorModeContext";

const TabIcon = ({ focused, icon, iconH, title }: any) => {
  return (
    <View className="flex flex-col items-center justify-center min-w-[70px] min-h-[50px]">
      <Image source={focused ? iconH : icon} className="w-7 h-7" />
      <Text
        className={`text-[10px] font-MonRegular ${
          focused ? "text-primary" : "text-icon"
        }`}
      >
        {title}
      </Text>
    </View>
  );
};

export default function TabsLayout() {
  const { isCreatorMode } = useCreatorMode();

  // USER MODE TABS
  if (!isCreatorMode) {
    return (
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 85,
            paddingHorizontal: 0,
            backgroundColor: "#181a20",
            borderTopWidth: 0,
          },
          tabBarItemStyle: {
            marginTop: 10,
          },
        }}
      >
        <Tabs.Screen
          name="creator-live"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="creator-dashboard"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="creator-analytics"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="creator-profile"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
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
  } else {
    // CREATOR MODE TABS
    return (
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 85,
            paddingHorizontal: 0,
            backgroundColor: "#1a1a2e", // Darker for creator mode
            borderTopWidth: 0,
          },
          tabBarItemStyle: {
            marginTop: 10,
          },
        }}
      >
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="creator-dashboard"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                icon={icons.dashboard}
                iconH={icons.dashboardH}
                title="Dashboard"
              />
            ),
          }}
        />

        <Tabs.Screen
          name="creator-live"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                icon={icons.live}
                iconH={icons.liveH}
                title="Go Live"
              />
            ),
          }}
        />

        <Tabs.Screen
          name="creator-analytics"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                icon={icons.analytics}
                iconH={icons.analyticsH}
                title="Analytics"
              />
            ),
          }}
        />

        <Tabs.Screen
          name="creator-profile"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                icon={icons.profile}
                iconH={icons.profileH}
                title="Channel"
              />
            ),
          }}
        />
      </Tabs>
    );
  }
}
