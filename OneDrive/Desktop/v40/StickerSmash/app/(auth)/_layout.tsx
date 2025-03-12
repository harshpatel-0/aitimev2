import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href="/home" />;
  }

  // Hide the header for all screens in this stack
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 
        If you want, you can explicitly list screens:
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
      */}
    </Stack>
  );
}
