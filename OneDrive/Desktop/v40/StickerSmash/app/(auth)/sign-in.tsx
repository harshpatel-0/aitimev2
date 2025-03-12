import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import SocialLoginButton from "@/components/SocialLoginButton"; // Adjust import if needed
import { useRouter } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";

// Warm up the browser for Android OAuth flows
WebBrowser.maybeCompleteAuthSession();
const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

export default function SignInPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  useWarmUpBrowser();

  // State for credential-based sign in
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isLoaded: isSignInLoaded, signIn, setActive } = useSignIn();

  // Handler for credential-based log in
  const handleLogin = async () => {
    if (!isSignInLoaded) return;
    try {
      const result = await signIn.create({
        identifier: email,
        password: password,
      });
      if (result.createdSessionId) {
        setActive({ session: result.createdSessionId });
        router.replace("/home");
      } else {
        console.error("Additional steps required for sign in", result);
      }
    } catch (error) {
      console.error("Sign in error: ", error);
    }
  };

  // Navigate to sign-up page when the user taps "Sign Up"
  const handleSignUpPress = () => {
    router.push("/(auth)/sign-up");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Title and brief description */}
      <Text style={styles.title}>AITime</Text>
      <Text style={styles.subtitle}>
        Your AI-powered calendar for work, life, & school
      </Text>

      {/* Credential form */}
      <View style={styles.formContainer}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          style={styles.input}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.forgotContainer}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        {/* OR & social login */}
        <Text style={styles.orText}>OR</Text>
        <SocialLoginButton />

        {/* Sign Up link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don’t have an account? </Text>
          <TouchableOpacity onPress={handleSignUpPress}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Make the entire screen blue
    backgroundColor: "#007BFF",
    alignItems: "center",
  },
  title: {
    marginTop: 140,
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
    // Use most of the screen width so the inputs are nicely spaced
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
  forgotContainer: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  forgotText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  loginButtonText: {
    color: "#007BFF",
    fontSize: 16,
    fontWeight: "600",
  },
  orText: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
    textAlign: "center",
  },
  signUpContainer: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "center",
  },
  signUpText: {
    fontSize: 15,
    paddingVertical: 270,
    color: "#fff",
  },
  signUpLink: {
    fontSize: 15,
    paddingVertical: 270,
    fontWeight: "500",
    color: "#fff",
    textDecorationLine: "underline",
  },
});
