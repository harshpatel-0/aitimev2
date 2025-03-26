import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { useUser, useAuth } from "@clerk/clerk-expo";

const events = [
  { id: "1", title: "Career Fair", time: "15:00 - 15:30", bgColor: "#F9F9F9" },
  { id: "2", title: "Group Fitness Class", time: "11:00 - 11:30", bgColor: "#FDEAE7" },
  { id: "3", title: "Art Exhibit", time: "14:00 - 15:00", bgColor: "#EAF4FF" },
  { id: "4", title: "Art Exhibit", time: "14:00 - 15:00", bgColor: "#EAF4FF" },
];

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { isLoaded, user } = useUser();
  const { signOut } = useAuth();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // When Clerk is loaded, if there's no user, redirect to sign‑in.
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setTimeout(() => {
        router.replace("/(auth)/sign-in");
      }, 0);
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }
  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      // Once signOut completes, user becomes null and the effect above redirects.
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../../../assets/images/husky.png")}
          style={styles.logo}
        />
        <View style={styles.textContainer}>
          <Text style={styles.extraBoldText}>Good Morning,</Text>
          <Text style={styles.boldHuskyText}>
            {user.firstName || "Husky"}!
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search Event..."
        placeholderTextColor="#FFF"
      />

      {/* Trending Events */}
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Today’s</Text>
        <Text style={styles.trendingText}>Trending Events:</Text>
      </View>

      {/* Events Grid */}
      <View style={styles.eventsGrid}>
        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={[styles.eventCard, { backgroundColor: event.bgColor }]}
            onPress={() => router.push(`/events/${event.id}`)}
          >
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventTime}>{event.time}</Text>
          </TouchableOpacity>
        ))}
        {/* View More Button Styled as a Card */}
        <TouchableOpacity
          style={styles.viewMoreCard}
          onPress={() => router.push("/events")}
        >
          <Text style={styles.viewMoreText}>View More</Text>
          <Text style={styles.viewMoreSubText}>+3 schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 80, // extra padding if needed for content above tabs
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 85,
    height: 85,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  extraBoldText: {
    fontWeight: "900",
    fontSize: 32,
    color: "#3478F6",
    textAlign: "right",
  },
  boldHuskyText: {
    fontWeight: "bold",
    fontSize: 28,
    color: "#3478F6",
    textAlign: "right",
  },
  searchBar: {
    backgroundColor: "#3478F6",
    padding: 25,
    borderRadius: 15,
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#FFF",
  },
  sectionTitleContainer: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 35,
    fontWeight: "900",
    color: "#000",
    marginBottom: -5,
  },
  trendingText: {
    fontSize: 35,
    fontWeight: "900",
    color: "#3478F6",
    textDecorationLine: "underline",
  },
  eventsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  eventTime: {
    fontSize: 14,
    color: "#666",
  },
  viewMoreCard: {
    backgroundColor: "#000",
    padding: 20,
    borderRadius: 20,
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
  },
  viewMoreText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },
  viewMoreSubText: {
    fontSize: 12,
    color: "#AAA",
  },
  signOutButton: {
    width: "80%",
    backgroundColor: "#E5383B",
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
    alignSelf: "center",
  },
  signOutButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
