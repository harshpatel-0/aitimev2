import React from "react";
import { Tabs } from "expo-router";
import CustomNavBar from "@/components/CustomNavBar"; // adjust path

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      // Render your custom nav bar
      tabBar={(props) => <CustomNavBar {...props} />}
    >
      <Tabs.Screen
        name="home/index"
        options={{ title: "Home" }}
      />
      <Tabs.Screen
        name="events/index"
        options={{ title: "Events" }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{ title: "Profile" }}
      />
    </Tabs>
  );
}
