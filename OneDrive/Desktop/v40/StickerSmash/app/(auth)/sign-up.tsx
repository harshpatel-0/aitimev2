import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSignUp, useSignIn } from "@clerk/clerk-expo";
import SocialLoginButton from "@/components/SocialLoginButton";

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { isLoaded: isSignUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp();
  const { isLoaded: isSignInLoaded, signIn, setActive: setActiveSignIn } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle the initial sign-up process
  const onSignUpPress = async () => {
    if (!isSignUpLoaded) return;
    try {
      setErrorMessage("");
      setIsLoading(true);

      // 1) Create a new user
      await signUp.create({ emailAddress, password });

      // 2) Send a verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Show the OTP input box
      setPendingVerification(true);
    } catch (err: any) {
      // If the user already exists, attempt sign-in
      if (err.message && err.message.includes("already exists")) {
        if (!isSignInLoaded) return;
        try {
          const result = await signIn.create({
            identifier: emailAddress,
            password,
          });
          if (result.createdSessionId) {
            setActiveSignIn({ session: result.createdSessionId });
            router.replace("/home");
          } else {
            setErrorMessage("Additional authentication steps required.");
          }
        } catch (signInErr: any) {
          setErrorMessage("Sign in error: " + (signInErr.message || ""));
        }
      } else {
        setErrorMessage(err.message || "An error occurred during sign up.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification submission (OTP)
  const onVerifyPress = async () => {
    if (!isSignUpLoaded) return;
    try {
      setErrorMessage("");
      setIsLoading(true);

      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });
      if (signUpAttempt.status === "complete") {
        // Verification success
        setActiveSignUp({ session: signUpAttempt.createdSessionId });
        router.replace("/home");
      } else {
        setErrorMessage("Verification failed. Please check your code and try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during verification.");
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------------------------
  // If we're waiting for the user to enter the OTP code:
  // ------------------------------------------------
  if (pendingVerification) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.title}>AITime</Text>
        <Text style={styles.subtitle}>Your AI-powered calendar for work, life, & school</Text>

        <View style={styles.formContainer}>
          <Text style={styles.verifyTitle}>Verify Your Email</Text>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Verification code"
            placeholderTextColor="#999"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad" // use numeric keypad for OTP
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={onVerifyPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#007BFF" />
            ) : (
              <Text style={styles.loginButtonText}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ------------------------------------------------
  // Normal sign-up form (no pending verification)
  // ------------------------------------------------
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Create an account</Text>
      <Text style={styles.subtitle}>Welcome! Please enter your details.</Text>

      <View style={styles.formContainer}>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={emailAddress}
          onChangeText={setEmailAddress}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* "Sign Up" button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={onSignUpPress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#007BFF" />
          ) : (
            <Text style={styles.loginButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <SocialLoginButton />

        {/* Button below Sign Up */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
            <Text style={styles.signUpLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ------------------------------------------------
// Styles (mirroring your SignIn approach)
// ------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#007BFF", // The entire screen is blue
    alignItems: "center",
  },
  title: {
    marginTop: 150,
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: "90%",
    marginTop: 20,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: "#fff",
    paddingVertical: 17,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 15,
  },
  loginButtonText: {
    color: "#007BFF",
    fontSize: 16,
    fontWeight: "600",
  },
  verifyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  signUpText: {
    fontSize: 15,
    color: "#fff",
    paddingVertical: 310,
  },
  signUpLink: {
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 310,
    color: "#fff",
    textDecorationLine: "underline",
  },
});
