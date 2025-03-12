import React, { useState } from "react";
import { useOAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import * as Linking from "expo-linking";

const SocialLoginButton = () => {
  // Fixed to use the Google OAuth strategy
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const buttonText = () => {
    return isLoading ? "Loading..." : "Continue with Google";
  };

  const buttonIcon = () => {
    return <Ionicons name="logo-google" size={24} color="#DB4437" />;
  };

  const onSocialLoginPress = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const { createdSessionId, setActive } = await startOAuthFlow({
        // Customize your redirect URL and scheme as needed
        redirectUrl: Linking.createURL("/dashboard", { scheme: "myapp" }),
      });

      if (createdSessionId) {
        console.log("Session created", createdSessionId);
        setActive?.({ session: createdSessionId });
        await user?.reload();
        // You can navigate to a protected route after successful login if desired:
        // router.replace("/dashboard");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  }, [startOAuthFlow, user]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onSocialLoginPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="black" />
      ) : (
        buttonIcon()
      )}
      <Text style={styles.buttonText}>{buttonText()}</Text>
    </TouchableOpacity>
  );
};

export default SocialLoginButton;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    // Make the container background white
    backgroundColor: "#fff",
    borderColor: "gray",
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    // Make text color black (or any contrasting color)
    color: "#000",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 10,
  },
});
