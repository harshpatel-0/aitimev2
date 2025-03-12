import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function EventDetailScreen() {
  const params = useLocalSearchParams();

  if (!params || !params.id) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Event not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{params.title}</Text>
      <Text style={styles.time}>{params.time}</Text>
      <Text style={styles.location}>Location: {params.location}</Text>
      <Text style={styles.clubName}>Club: {params.clubName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  time: {
    fontSize: 18,
    color: "#3478F6",
    marginBottom: 10,
  },
  location: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  clubName: {
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },
});
