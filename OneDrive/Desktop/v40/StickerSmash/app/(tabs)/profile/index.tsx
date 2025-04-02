import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Correct import

// Define the survey questions as provided
const QUESTIONS = [
  {
    text: "What’s your major & are there other academic interests you’d like to explore?",
    input: true,
  },
  {
    text: "Are you a part of any clubs?",
    options: ["Yes", "No"],
  },
  {
    text: "What kind of activities or events do you enjoy most? Select all that apply",
    options: [
      "Workshops/Seminars",
      "Social Gatherings",
      "Outdoor/Sports",
      "Community Service/Volunteering",
      "Cultural/International Events",
      "Career & Networking Opportunities",
    ],
    multiple: true,
  },
  {
    text: "What is your primary motivation for attending campus events? Select all that apply",
    options: [
      "Networking",
      "Learning new skills",
      "Socializing",
      "Exploring new interests",
    ],
    multiple: true,
  },
];

export default function ProfileScreen() {
  // For testing, you can either use the real userId or hard-code it
  // const { userId } = useAuth();
  // Uncomment below to hard-code for testing
  const userId = "user_2tsn0UVDdMEYy1AdjktgIpzy0zN";

  const [surveyResults, setSurveyResults] = useState<any>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch survey results using the Clerk userId (or hard-coded userId)
  useEffect(() => {
    async function fetchSurveyResults() {
      if (!userId) return;
      try {
        const response = await fetch(
          `https://2lt3y32cwl.execute-api.us-east-1.amazonaws.com/test2/survey?userId=${userId}`
        );
        const data = await response.json();
        console.log("Raw API response:", data);
        
        // Check if the response includes a body property
        let surveyData = data;
        if (data.body) {
          surveyData = JSON.parse(data.body);
        }
        console.log("Parsed survey data:", surveyData);
        
        // Depending on your API structure, results may be under surveyResults or directly as answers.
        if (surveyData.surveyResults) {
          setSurveyResults(surveyData.surveyResults);
        } else if (surveyData.answers) {
          setSurveyResults({ answers: surveyData.answers });
        } else {
          setError("No survey results found for your account.");
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error fetching survey results:", err);
        setError("Error fetching survey results.");
        setLoading(false);
      }
    }
    fetchSurveyResults();
  }, [userId]);

  // Helper to format an answer: if it's an array, join its values; otherwise, return the value directly.
  const formatAnswer = (answer: any): string => {
    if (Array.isArray(answer)) {
      return answer.join(", ");
    }
    return answer;
  };

  // 2. Once we have survey results, call Gemini API to generate a personalized message.
  useEffect(() => {
    async function fetchGeminiResponse() {
      if (!surveyResults) return;
      // Build a detailed prompt from the survey questions and answers.
      let prompt =
        "The following are the survey questions and the user's responses:\n\n";
      // Expecting surveyResults.answers to be in the form: { "answers": [ ... ] }
      const answers = surveyResults.answers;
      for (let i = 0; i < QUESTIONS.length; i++) {
        const questionText = QUESTIONS[i].text;
        const answerText = formatAnswer(answers[i]);
        prompt += `Question ${i + 1}: ${questionText}\nAnswer: ${answerText}\n\n`;
      }
      prompt +=
        "Based on these responses, please generate a personalized profile message for the user.";

      try {
        // Initialize the client with your API key.
        const genAI = new GoogleGenerativeAI("AIzaSyD1789j5r9sf50BnCGF2VV6NKYUF1G51jY"); // Replace with your actual API key
        // Select the Gemini 2.0 Flash model.
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        setAiResponse(text);
      } catch (err: any) {
        console.error("Error calling Gemini API:", err);
        setError("Error generating AI response.");
      }
      setLoading(false);
    }
    fetchGeminiResponse();
  }, [surveyResults]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Page</Text>
      <Text style={styles.subtitle}>Your personalized message:</Text>
      <Text style={styles.response}>{aiResponse}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  response: {
    fontSize: 16,
    color: "green",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});
