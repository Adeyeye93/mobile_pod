import { Tabs, Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { View, Text, Image } from "react-native";
import { icons } from "../../constants/icons";

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
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 85,
          paddingHorizontal: 25,
          backgroundColor: "#181a20",
          borderTopWidth: 0,
        },
        tabBarItemStyle: {
          marginTop: 10,
        },
      }}
    >
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
}
