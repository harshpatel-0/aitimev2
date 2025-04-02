import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Helper function to parse event date from a string like "Thursday, March 30 at 11:35AM"
function parseEventDate(timeStr) {
  const regex = /[A-Za-z]+,\s+([A-Za-z]+)\s+(\d+)/;
  const match = timeStr.match(regex);
  if (match) {
    const monthName = match[1];
    const date = parseInt(match[2], 10);
    const monthMap = {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12,
    };
    return { month: monthMap[monthName], date };
  }
  return null;
}

// Static arrays for trending and personalized events
const trendingEvents = [
  {
    id: "1",
    title: "Career Fair",
    time: "Thursday, March 30 at 15:00",
    gradient: ["#FEC84B", "#FDA65A"],
    icon: "briefcase",
  },
  {
    id: "2",
    title: "Group Fitness Class",
    time: "Thursday, March 30 at 11:00",
    gradient: ["#B9E4F1", "#EAF4FF"],
    icon: "barbell",
  },
  {
    id: "3",
    title: "Art Exhibit",
    time: "Thursday, March 30 at 14:00",
    gradient: ["#FFF5CC", "#FDEEA8"],
    icon: "color-palette",
  },
  {
    id: "4",
    title: "Music Fest",
    time: "Thursday, March 30 at 19:00",
    gradient: ["#D1D8E0", "#F9F9F9"],
    icon: "musical-notes",
  },
];

const personalizedEvents = [
  {
    id: "5",
    title: "Tech Talk",
    time: "Thursday, March 30 at 16:00",
    gradient: ["#8EC5FC", "#E0C3FC"],
    icon: "laptop-outline",
  },
  {
    id: "6",
    title: "Cooking Workshop",
    time: "Thursday, March 30 at 12:00",
    gradient: ["#FF9A9E", "#FAD0C4"],
    icon: "restaurant",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { isLoaded, user } = useUser();
  const [todaysEventCount, setTodaysEventCount] = useState(0);
  const [fetchingEvents, setFetchingEvents] = useState(true);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Redirect to sign‑in if no user.
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setTimeout(() => {
        router.replace("/(auth)/sign-in");
      }, 0);
    }
  }, [isLoaded, user, router]);

  // Fetch events from API and calculate today's event count.
  useEffect(() => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDate = today.getDate();

    fetch("https://2lt3y32cwl.execute-api.us-east-1.amazonaws.com/dev/clubs")
      .then((response) => response.json())
      .then((data) => {
        let eventsData = [];
        if (data.body) {
          try {
            eventsData = JSON.parse(data.body);
          } catch (err) {
            console.error("Error parsing API body:", err);
          }
        } else {
          eventsData = data;
        }
        // Filter events where the parsed month and date match today's month and date.
        const todaysEvents = eventsData.filter((evt) => {
          const parsed = parseEventDate(evt.Time);
          return parsed && parsed.month === currentMonth && parsed.date === currentDate;
        });
        setTodaysEventCount(todaysEvents.length);
        setFetchingEvents(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setFetchingEvents(false);
      });
  }, []);

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Signing out...</Text>
      </View>
    );
  }

  const totalEvents = trendingEvents.length;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Centered Greeting */}
        <Text style={styles.welcomeText}>
          Welcome, <Text style={styles.userName}>{user.firstName || "Guest"}</Text>.
        </Text>

        {/* Info Card (Today's Events) */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardContent}>
            <Text style={styles.cardTitle}>Today's Events</Text>
            {fetchingEvents ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.cardValue}>{todaysEventCount} Events</Text>
            )}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push("/events")}
            >
              <Text style={styles.ctaButtonText}>Explore Events</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={require("../../../assets/images/husky.png")}
            style={styles.uconnLogo}
          />
        </View>

        {/* Trending Events Section */}
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsHeaderText}>Trending Events</Text>
          <TouchableOpacity onPress={() => router.push("/events")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventsHorizontalScroll}>
          {trendingEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              onPress={() => router.push(`/events/${event.id}`)}
              style={styles.cardWrapper}
            >
              <LinearGradient
                colors={event.gradient}
                style={styles.eventCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventTime}>{event.time}</Text>
                <View style={styles.iconCircle}>
                  <Ionicons name={event.icon} size={24} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Personalized Events Section */}
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsHeaderText}>Your Personalized Events</Text>
          <TouchableOpacity onPress={() => router.push("/events/personalized")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventsHorizontalScroll}>
          {personalizedEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              onPress={() => router.push(`/events/${event.id}`)}
              style={styles.cardWrapper}
            >
              <LinearGradient
                colors={event.gradient}
                style={styles.eventCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventTime}>{event.time}</Text>
                <View style={styles.iconCircle}>
                  <Ionicons name={event.icon} size={24} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    backgroundColor: "#F9F9F9",
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  userName: {
    color: "#3478F6",
  },
  infoCard: {
    backgroundColor: "#3478F6",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoCardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 5,
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
  },
  ctaButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
  },
  ctaButtonText: {
    color: "#3478F6",
    fontSize: 16,
    fontWeight: "bold",
  },
  uconnLogo: {
    width: 110,
    height: 110,
    marginLeft: 15,
  },
  eventsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  eventsHeaderText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#3478F6",
    fontWeight: "600",
  },
  eventsHorizontalScroll: {
    marginBottom: 30,
  },
  cardWrapper: {
    marginRight: 16,
  },
  eventCard: {
    width: 140,
    height: 180,
    borderRadius: 20,
    padding: 15,
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 13,
    fontWeight: "500",
    color: "#fff",
  },
  iconCircle: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
});
