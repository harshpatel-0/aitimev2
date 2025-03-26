import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import Input from "@/components/Input"; // Ensure this component exists
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { MaterialIcons } from "@expo/vector-icons";
import { PRIMARY_COLOR } from "@/constants/sign-in";
import SocialLoginButton from "@/components/SocialLoginButton";

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
  const { isLoaded, signIn, setActive } = useSignIn();

  const handleLogin = async () => {
    if (!isLoaded) return;
    try {
      const result = await signIn.create({
        identifier: email,
        password: password,
      });
      if (result.createdSessionId) {
        setActive({ session: result.createdSessionId });
        router.replace("/survey");
      } else {
        console.error("Additional steps required for sign in", result);
      }
    } catch (error) {
      console.error("Sign in error: ", error);
    }
  };

  const handleSignUpPress = () => {
    console.log("Navigating to sign-up");
    router.push("/(auth)/sign-up");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.mainContainer}>
        <Text style={styles.title}>AITime</Text>
        <Text style={styles.description}>
          Your{" "}
          <Text style={styles.bold}>AI-powered, tailored</Text> calendar{"\n"}for work, life, & school
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <Input
          label="Your email"
          placeholder="Enter email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          icon={() => (
            <MaterialCommunityIcons
              name="email-outline"
              size={24}
              color="#6e6e6e"
            />
          )}
        />
        <View style={{ marginTop: 4 }}>
          <Input
            label="Your password"
            placeholder="Enter password"
            autoCapitalize="none"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            icon={() => (
              <MaterialIcons name="lock-outline" size={28} color="#6e6e6e" />
            )}
          />
        </View>

        <TouchableOpacity style={styles.forgotPasswordButton}>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logInButton} onPress={handleLogin}>
          <Text style={styles.login}>Log in</Text>
        </TouchableOpacity>

        <SocialLoginButton />
        <Text style={styles.quote}>
          <Text style={styles.bold}>—</Text> where your calendar meets you!
        </Text>
        
      </View>
      

      <View style={styles.bottomContainer}>
        <Text style={styles.account}>Don't have an account?</Text>
        <TouchableOpacity onPress={handleSignUpPress}>
          <Text style={styles.createAnAccount}> Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  mainContainer: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
  },
  title: {
    fontSize: 48,
    fontWeight: "800",
    color: PRIMARY_COLOR,
    textAlign: "center",
  },
  description: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6e6e6e",
    textAlign: "center",
  },
  quote: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6e6e6e",
    textAlign: "center",
    top: 35,
  },
  bold: {
    fontWeight: "bold",
  },
  inputContainer: {
    flex: 1,
    width: "100%",
    marginTop: 27,

  },
  logInButton: {
    width: "100%",
    padding: 16,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  login: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  forgotPasswordButton: {
    marginTop: 8,
    alignSelf: "flex-end",
  },
  forgotPassword: {
    color: PRIMARY_COLOR,
    fontWeight: "600",
  },
  bottomContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  account: {
    color: "#6e6e6e",
    fontWeight: "600",
    bottom: 20,
  },
  createAnAccount: {
    color: PRIMARY_COLOR,
    fontWeight: "600",
    bottom: 20,
  },
});

