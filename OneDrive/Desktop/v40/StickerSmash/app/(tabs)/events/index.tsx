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
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EventItem {
  id: string;
  clubName: string;
  title: string;
  time: string; // e.g., "Thursday, March 30 at 11:35AM"
  location: string;
}

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// --- Helper Functions ---
function generateDaysInMonth(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]; // short day names
  return Array.from({ length: daysInMonth }, (_, i) => ({
    // We shift dayNames so that the 1st of the month lines up with correct day
    day: dayNames[(firstDay + i) % 7],
    date: i + 1,
  }));
}

function parseEventDate(timeStr: string): { month: number; date: number } | null {
  const regex = /[A-Za-z]+,\s+([A-Za-z]+)\s+(\d+)/;
  const match = timeStr.match(regex);
  if (match) {
    const monthName = match[1];
    const date = parseInt(match[2], 10);
    const monthMap: Record<string, number> = {
      January: 1, February: 2, March: 3, April: 4, May: 5,
      June: 6, July: 7, August: 8, September: 9, October: 10,
      November: 11, December: 12,
    };
    return { month: monthMap[monthName], date };
  }
  return null;
}

function parseEventTimeToMinutes(timeStr: string): number | null {
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
}

function formatMinutesToTimeString(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const amPm = hours24 < 12 ? "AM" : "PM";
  const mm = minutes < 10 ? `0${minutes}` : minutes.toString();
  return `${hours12}:${mm}${amPm}`;
}

function splitTimeString(timeStr: string): [string, string] {
  const regex = /^(\d{1,2}:\d{2})(AM|PM)$/;
  const match = timeStr.match(regex);
  if (match) {
    return [match[1], match[2]];
  }
  return [timeStr, ""];
}

function groupEventsByTime(events: EventItem[]) {
  const grouped: Record<string, EventItem[]> = {};
  events.forEach((evt) => {
    const minutes = parseEventTimeToMinutes(evt.time);
    if (minutes !== null) {
      const timeKey = formatMinutesToTimeString(minutes);
      if (!grouped[timeKey]) grouped[timeKey] = [];
      grouped[timeKey].push(evt);
    }
  });
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const aMin = parseTimeKeyToMinutes(a);
    const bMin = parseTimeKeyToMinutes(b);
    return aMin - bMin;
  });
  return sortedKeys.map((timeKey) => ({ timeKey, events: grouped[timeKey] }));
}

function parseTimeKeyToMinutes(timeKey: string): number {
  const regex = /^(\d{1,2}):(\d{2})(AM|PM)$/;
  const match = timeKey.match(regex);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const amPm = match[3];
    if (amPm === "PM" && hour !== 12) hour += 12;
    if (amPm === "AM" && hour === 12) hour = 0;
    return hour * 60 + minute;
  }
  return 0;
}

// --- Main Component ---
export default function CombinedCalendarEventsScreen() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Use a fixed-height container for the timeline so the vertical line stays static
  const [timelineContainerHeight, setTimelineContainerHeight] = useState<number>(400);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number>(today.getDate());

  // Add a current time state and update it every minute
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  // For categories (example)
  const categories = ["ALL EVENTS", "CONCERTS", "TECHNOLOGY", "SPORTS"];
  const [selectedCategory, setSelectedCategory] = useState("ALL EVENTS");

  // Fetch events from the API
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

  const days = generateDaysInMonth(currentYear, currentMonth);

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev + 1) % 12);
    if (currentMonth === 11) setCurrentYear((prev) => prev + 1);
    setSelectedDate(1);
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev - 1 + 12) % 12);
    if (currentMonth === 0) setCurrentYear((prev) => prev - 1);
    setSelectedDate(1);
  };

  // Filter and sort events for the selected date
  const filteredEvents = events.filter((e) => {
    const parsed = parseEventDate(e.time);
    if (!parsed) return false;
    return parsed.month === currentMonth + 1 && parsed.date === selectedDate;
  });
  const sortedFilteredEvents = filteredEvents.sort((a, b) => {
    const aMin = parseEventTimeToMinutes(a.time) || 0;
    const bMin = parseEventTimeToMinutes(b.time) || 0;
    return aMin - bMin;
  });

  const timelineGroups = groupEventsByTime(sortedFilteredEvents);

  const onTimelineContainerLayout = (e: any) => {
    setTimelineContainerHeight(e.nativeEvent.layout.height);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD33D" />
      </View>
    );
  }

  const closeModal = () => {
    setSelectedEvent(null);
  };

  // Convert the current time to minutes since midnight
  const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // Determine if an event group is the "current" group
  function isCurrentGroup(index: number, groupStart: number) {
    const nextGroupStart =
      index + 1 < timelineGroups.length
        ? parseTimeKeyToMinutes(timelineGroups[index + 1].timeKey)
        : Infinity;
    return (
      selectedDate === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear() &&
      currentTimeMinutes >= groupStart &&
      currentTimeMinutes < nextGroupStart
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Calendar Container (White with rounded corners) */}
      <View style={styles.dateNavigatorContainer}>
        {/* Month + Arrows */}
        <View style={styles.monthContainer}>
          <Button title="<" onPress={handlePrevMonth} color="#000" />
          <Text style={styles.monthText}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
          <Button title=">" onPress={handleNextMonth} color="#000" />
        </View>

        {/* Days of the Month in a Horizontal List */}
        <FlatList
          data={days}
          horizontal
          keyExtractor={(item) => item.date.toString()}
          showsHorizontalScrollIndicator={false}
          style={{ height: 70 }}
          contentContainerStyle={styles.flatListContainer}
          renderItem={({ item }) => {
            const isSelected = selectedDate === item.date;
            return (
              <TouchableOpacity
                style={[styles.dateItem, isSelected && styles.selectedDate]}
                onPress={() => setSelectedDate(item.date)}
              >
                <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{item.day}</Text>
                <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
                  {item.date}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* SEARCH BAR & CATEGORIES UNDERNEATH THE CALENDAR */}
      <View style={styles.searchAndCategories}>
        <TouchableOpacity style={styles.searchIcon}>
          <Ionicons name="search" size={24} color="#000" />
        </TouchableOpacity>
        <ScrollView
          horizontal
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((cat) => {
            const isSelected = cat === selectedCategory;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* "Today's Events:" Label */}
      <Text style={styles.todaysEventsLabel}>Today's Events:</Text>

      {/* Timeline Container */}
      <View style={styles.timelineContainer} onLayout={onTimelineContainerLayout}>
        <ScrollView style={styles.timelineScroll} showsVerticalScrollIndicator={false}>
          {timelineGroups.length > 0 ? (
            timelineGroups.map((group, index) => {
              const groupStart = parseTimeKeyToMinutes(group.timeKey);
              const currentGroup = isCurrentGroup(index, groupStart);
              const [timePart, periodPart] = splitTimeString(group.timeKey);

              return (
                <View key={group.timeKey} style={styles.timelineRow}>
                  {/* Left Column: Time Label & segmented vertical line */}
                  <View style={styles.timeColumn}>
                    <View style={styles.timeLabelContainer}>
                      <Text style={styles.timeText}>{timePart}</Text>
                      <Text style={styles.timePeriod}>{periodPart}</Text>
                    </View>
                    <View style={styles.lineSegment} />
                  </View>

                  {/* Right Column: Event Cards */}
                  <View style={styles.eventsColumn}>
                    {group.events.map((evt) => (
                      <TouchableOpacity
                        key={evt.id}
                        style={[styles.eventCard, currentGroup && styles.eventHighlight]}
                        onPress={() => setSelectedEvent(evt)}
                      >
                        <View style={styles.eventInfo}>
                          <Text style={styles.eventTitle}>{evt.title}</Text>
                          <Text style={styles.eventLocation}>{evt.location}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#007AFF" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <Text style={styles.noEventText}>No events for this date.</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Modal Popup */}
      <Modal
        visible={selectedEvent !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                {selectedEvent && (
                  <>
                    <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                    <Text style={styles.modalDetails}>🚩 {selectedEvent.clubName}</Text>
                    <Text style={styles.modalDetails}>🗓️ {selectedEvent.time}</Text>
                    <Text style={styles.modalDetails}>📍 {selectedEvent.location}</Text>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

/* --- Styles --- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Calendar Container (white card) */
  dateNavigatorContainer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginHorizontal: 10,
    marginTop: 10,
    paddingVertical: 10,
    alignItems: "center",
    // Subtle shadow for iOS + Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  monthContainer: {
    flexDirection: "row",
    width: "90%",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  flatListContainer: {
    paddingHorizontal: 10,
    alignItems: "center",
  },

  /* Individual Day Item */
  dateItem: {
    width: 45,
    height: 60,
    borderRadius: 15,
    marginHorizontal: 5,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 3,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },
  selectedDate: {
    backgroundColor: "#007AFF",
  },
  selectedDayText: {
    color: "#FFF",
  },
  selectedDateText: {
    color: "#FFF",
  },

  /* SEARCH BAR & CATEGORIES (Underneath Calendar) */
  searchAndCategories: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  categoryScroll: {
    flex: 1,
  },
  categoryContainer: {
    alignItems: "center",
  },
  categoryItem: {
    backgroundColor: "#E5EDFB",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  categoryItemSelected: {
    backgroundColor: "#007AFF",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  categoryTextSelected: {
    color: "#FFF",
  },

  /* "Today's Events:" Label */
  todaysEventsLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginLeft: 15,
    marginBottom: 5,
  },

  /* Timeline Container */
  timelineContainer: {
    flex: 1,
    marginTop: 5,
    marginHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  timelineScroll: {
    flex: 1,
  },
  timelineRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  timeColumn: {
    width: 60,
    alignItems: "center",
    paddingRight: 10,
  },
  timeLabelContainer: {
    marginBottom: 4,
    alignItems: "center",
  },
  timeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  timePeriod: {
    fontSize: 14,
    color: "#000",
  },
  lineSegment: {
    flex: 1,
    width: 2,
    backgroundColor: "#3A73AF",
    marginTop: 4,
    alignSelf: "center",
  },
  eventsColumn: {
    flex: 1,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5EDFB",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E2E2",
  },
  // For the current time group, we add a thick blue border
  eventHighlight: {
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: "#333",
  },
  noEventText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: screenWidth * 0.8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: "#3A73AF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#3A73AF",
    textAlign: "center",
  },
  modalDetails: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: "center",
    color: "#333",
  },
});
