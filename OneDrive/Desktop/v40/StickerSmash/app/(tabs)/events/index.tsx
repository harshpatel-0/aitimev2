import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Dimensions, 
  Button,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";

interface EventItem {
  id: string;
  clubName: string;
  title: string;
  time: string;
  location: string;
}

interface GroupedData {
  [clubName: string]: {
    Location: string;
    Event: string;
    Time: string;
  }[];
}

const screenWidth = Dimensions.get("window").width;
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const generateDaysInMonth = (year: number, month: number) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return Array.from({ length: daysInMonth }, (_, i) => ({
    day: dayNames[(firstDay + i) % 7],
    date: i + 1,
  }));
};

const parseEventDate = (timeStr: string): { month: number; date: number } | null => {
  const regex = /[A-Za-z]+,\s+([A-Za-z]+)\s+(\d+)/;
  const match = timeStr.match(regex);
  if (match) {
    const monthName = match[1];
    const date = parseInt(match[2], 10);
    const monthMap: Record<string, number> = {
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
};

const parseEventTime = (timeStr: string): number | null => {
  const regex = /at\s+(\d{1,2}):(\d{2})(AM|PM)/;
  const match = timeStr.match(regex);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const period = match[3];
    if (period === "PM" && hour !== 12) hour += 12;
    else if (period === "AM" && hour === 12) hour = 0;
    return hour * 60 + minute;
  }
  return null;
};

export default function CombinedCalendarEventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Use today's date by default
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number>(today.getDate());

  // Fetch events on mount and transform API response keys
  useEffect(() => {
    fetch("https://2lt3y32cwl.execute-api.us-east-1.amazonaws.com/dev/clubs")
      .then((response) => response.json())
      .then((data) => {
        let eventsData: any[] = [];
        if (data.body) {
          try {
            eventsData = JSON.parse(data.body);
          } catch (err) {
            console.error("Error parsing API body:", err);
          }
        } else {
          eventsData = data;
        }
        // Transform each event to match our EventItem interface
        const eventsList: EventItem[] = eventsData.map((evt, index) => ({
          id: evt.EventID || `${evt["Club Name"]}-${index}`,
          clubName: evt["Club Name"],
          title: evt.Event,
          time: evt.Time,
          location: evt.Location,
        }));
        setEvents(eventsList);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
      });
  }, []);

  // Generate days in month
  const days = generateDaysInMonth(currentYear, currentMonth);

  // Month navigation
  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth + 1) % 12);
    if (currentMonth === 11) setCurrentYear((prevYear) => prevYear + 1);
    setSelectedDate(1);
  };
  const handlePrevMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth - 1 + 12) % 12);
    if (currentMonth === 0) setCurrentYear((prevYear) => prevYear - 1);
    setSelectedDate(1);
  };

  // Filter events for the selected date
  const filteredEvents = events.filter((e) => {
    const parsed = parseEventDate(e.time);
    if (!parsed) return false;
    return parsed.month === currentMonth + 1 && parsed.date === selectedDate;
  });
  const sortedFilteredEvents = filteredEvents.sort((a, b) => {
    const timeA = parseEventTime(a.time) || 0;
    const timeB = parseEventTime(b.time) || 0;
    return timeA - timeB;
  });

  // Tomorrow's events
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowMonth = tomorrow.getMonth() + 1;
  const tomorrowDate = tomorrow.getDate();

  const upcomingEvents = events.filter((e) => {
    const parsed = parseEventDate(e.time);
    if (!parsed) return false;
    return parsed.month === tomorrowMonth && parsed.date === tomorrowDate;
  });
  const sortedUpcomingEvents = upcomingEvents.sort((a, b) => {
    const timeA = parseEventTime(a.time) || 0;
    const timeB = parseEventTime(b.time) || 0;
    return timeA - timeB;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD33D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Month / Year + Navigation */}
      <View style={styles.monthContainer}>
        <Button title="<" onPress={handlePrevMonth} color="white" />
        <Text style={styles.monthText}>
          {months[currentMonth]} {currentYear}
        </Text>
        <Button title=">" onPress={handleNextMonth} color="white" />
      </View>

      {/* Horizontal Day List */}
      <FlatList
        data={days}
        horizontal
        keyExtractor={(item) => item.date.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.dateItem,
              selectedDate === item.date && styles.selectedDate,
            ]}
            onPress={() => setSelectedDate(item.date)}
          >
            <Text style={styles.dayText}>{item.day}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Scrollable Container for Events */}
      <ScrollView
        style={styles.eventsScroll}
        contentContainerStyle={styles.eventsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Events */}
        <View style={styles.eventContainer}>
          <Text style={styles.eventHeader}>Today's Events:</Text>
          {sortedFilteredEvents.length > 0 ? (
            sortedFilteredEvents.map((evt) => (
              <TouchableOpacity
                key={evt.id}
                style={styles.eventItem}
                onPress={() =>
                  router.push({
                    pathname: "/events/[id]",
                    params: {
                      id: evt.id,
                      clubName: evt.clubName,
                      title: evt.title,
                      time: evt.time,
                      location: evt.location,
                    },
                  })
                }
              >
                <Text style={styles.eventTitle}>{evt.title}</Text>
                <Text style={styles.eventTime}>{evt.time}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noEventText}>No events for this date.</Text>
          )}
        </View>

        {/* Tomorrow's Events */}
        <View style={styles.eventContainer}>
          <Text style={styles.eventHeader}>Upcoming Events for Tomorrow:</Text>
          {sortedUpcomingEvents.length > 0 ? (
            sortedUpcomingEvents.map((evt) => (
              <TouchableOpacity
                key={evt.id}
                style={styles.eventItem}
                onPress={() =>
                  router.push({
                    pathname: "/events/[id]",
                    params: {
                      id: evt.id,
                      clubName: evt.clubName,
                      title: evt.title,
                      time: evt.time,
                      location: evt.location,
                    },
                  })
                }
              >
                <Text style={styles.eventTitle}>{evt.title}</Text>
                <Text style={styles.eventTime}>{evt.time}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noEventText}>No upcoming events.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3A73AF",
    paddingVertical: 20,
    alignItems: "center",
    paddingBottom: 70,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  monthContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: screenWidth * 0.8,
    marginBottom: 0,
  },
  monthText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    padding: 25,
  },
  flatListContainer: {
    paddingHorizontal: 15,
  },
  dateItem: {
    width: 60,
    height: 80,
    marginHorizontal: 5,
    backgroundColor: "#5784BA",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDate: {
    backgroundColor: "white",
  },
  dayText: {
    fontSize: 14,
    color: "white",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  eventsScroll: {
    flex: 1,
    width: "100%",
    marginTop: 10,
  },
  eventsScrollContent: {
    paddingBottom: 20,
    alignItems: "center",
  },
  eventContainer: {
    marginTop: 10,
    backgroundColor: "white",
    padding: 10,
    width: screenWidth * 0.9,
    borderRadius: 10,
  },
  eventHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  eventItem: {
    padding: 8,
    backgroundColor: "#f0f0f0",
    marginVertical: 5,
    borderRadius: 5,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3A73AF",
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 14,
    color: "gray",
  },
  noEventText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
});
