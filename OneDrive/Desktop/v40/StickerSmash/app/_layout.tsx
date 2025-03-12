import React from "react";
import { tokenCache } from "@/cache";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const activeColorScheme = colorScheme ?? "light";
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env");
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <Tabs
          screenOptions={{
            // Remove the top header across all screens
            headerShown: false,
            // Tab styling
            tabBarActiveTintColor: "#ffd33d",
            tabBarStyle: {
              backgroundColor: "#25292e",
            },
            // Use your custom tab button & background
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
          }}
        >
          {/* Visible tabs */}
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="events/index"
            options={{
              title: "Events",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="calendar" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />

          {/* Hidden tabs/routes */}
          <Tabs.Screen
            name="(auth)"
            options={{
              // Hide from the tab bar
              href: null,
              // Important: hide the tab bar for sign-in or sign-up
              tabBarStyle: { display: "none" },
            }}
          />
          <Tabs.Screen name="events/[id]" options={{ href: null }} />
          <Tabs.Screen name="+not-found" options={{ href: null }} />
        </Tabs>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
