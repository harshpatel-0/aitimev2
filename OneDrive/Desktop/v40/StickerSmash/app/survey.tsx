// app/survey.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { PRIMARY_COLOR } from "@/constants/sign-in";

// Example question array
const QUESTIONS = [
  {
    text: "Which one of the following is the greatest circle?",
    options: ["Arctic Circle", "Equator", "Tropic of cancer", "Tropic of capricorn"],
  },
  {
    text: "How many events do you schedule weekly?",
    options: ["1-5", "5-10", "10-20", "20+"],
  },
  {
    text: "How many events do you schedule weekly?",
    options: ["1-5", "5-10", "10-20", "20+"],
  },
  {
    text: "Which one of the following is the greatest circle?",
    options: ["Arctic Circle", "Equator", "Tropic of cancer", "Tropic of capricorn"],
  },
  {
    text: "How many events do you schedule weekly?",
    options: ["1-5", "5-10", "10-20", "20+"],
  },
  {
    text: "How many events do you schedule weekly?",
    options: ["1-5", "5-10", "10-20", "20+"],
  },
];

export default function SurveyPage() {
  const router = useRouter();
  // 1) From Clerk: userId is the logged-in user's ID
  const { userId } = useAuth();

  // 2) Track which question the user is on
  const [currentIndex, setCurrentIndex] = useState(0);

  // 3) Store each question's selected answer. Initialize with null for each question.
  const [answers, setAnswers] = useState<(string | null)[]>(
    () => QUESTIONS.map(() => null)
  );

  // Extract the current question's data
  const currentQuestion = QUESTIONS[currentIndex];
  const total = QUESTIONS.length;

  // Called when user taps an option
  const selectOption = (option: string) => {
    console.log(
      `selectOption: User selected "${option}" for question index ${currentIndex}`
    );
    const newAnswers = [...answers];
    newAnswers[currentIndex] = option;
    setAnswers(newAnswers);
  };

  // Check if an option is selected
  const isSelected = (option: string) => {
    return answers[currentIndex] === option;
  };

  // Called when user taps "Next" or "Submit"
  const handleNext = async () => {
    console.log(`handleNext: currentIndex = ${currentIndex}`);
    // If not on the final question, show the next one
    if (currentIndex < total - 1) {
      console.log("handleNext: moving to the next question");
      setCurrentIndex((prev) => prev + 1);
    } else {
      // We are on the last question -> Submit answers
      console.log("handleNext: Reached the last question!");
      console.log("User answers:", answers);

      // Make sure user is logged in with Clerk
      if (!userId) {
        console.error("No userId found. Are you logged in?");
        router.replace("/home");
        return;
      }

      console.log(`Submitting to AWS with userId=${userId}...`);
      // POST answers to your AWS endpoint
      try {
        const response = await fetch(
          "https://2lt3y32cwl.execute-api.us-east-1.amazonaws.com/demo/survey",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              answers,
            }),
          }
        );

        if (!response.ok) {
          // If the server responded with an error code, parse and throw
          const errorData = await response.json();
          throw new Error(`Server Error ${response.status}: ${JSON.stringify(errorData)}`);
        }

        console.log("Survey data saved successfully!");
      } catch (err) {
        console.error("Failed to submit survey:", err);
      }

      // Finally, navigate away (e.g., to home)
      console.log("Navigating to /home...");
      router.replace("/home");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top header row: back button + question counter */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.questionCounter}>
          {currentIndex + 1} of {total}
        </Text>
      </View>

      {/* Main content area */}
      <View style={styles.mainContainer}>
        {/* Question text */}
        <Text style={styles.questionText}>{currentQuestion.text}</Text>

        {/* Display each option as a button */}
        {currentQuestion.options.map((option, idx) => {
          const selected = isSelected(option);
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.optionContainer,
                selected && styles.optionSelected,
              ]}
              onPress={() => selectOption(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  selected && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Next/Submit Button */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            !answers[currentIndex] && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!answers[currentIndex]} // disable until user selects an option
        >
          <Text style={styles.nextButtonText}>
            {currentIndex < total - 1 ? "Next" : "Submit"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

//
// STYLES - Mirroring the design from your sign-in page
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backButton: {
    paddingRight: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 20,
    color: PRIMARY_COLOR,
    fontWeight: "600",
  },
  questionCounter: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6e6e6e",
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  questionText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
  },
  optionContainer: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
  },
  optionSelected: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: "#f3f9ff",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  optionTextSelected: {
    color: PRIMARY_COLOR,
    fontWeight: "700",
  },
  nextButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_COLOR,
  },
  nextButtonDisabled: {
    backgroundColor: "#ccc",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
