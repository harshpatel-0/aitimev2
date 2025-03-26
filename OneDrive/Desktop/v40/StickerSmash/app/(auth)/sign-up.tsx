// app/(auth)/sign-up.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSignUp, useSignIn } from '@clerk/clerk-expo';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { isLoaded: isSignUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp();
  const { isLoaded: isSignInLoaded, signIn, setActive: setActiveSignIn } = useSignIn();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ------------------------------------------------
  // Handle the initial sign-up process
  // ------------------------------------------------
  const onSignUpPress = async () => {
    if (!isSignUpLoaded) return;
    try {
      setErrorMessage('');
      setIsLoading(true);

      // 1) Create a new user
      await signUp.create({ emailAddress, password });

      // 2) Send a verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Show the OTP input box
      setPendingVerification(true);
    } catch (err: any) {
      // If the user already exists, attempt sign-in
      if (err.message && err.message.includes('already exists')) {
        if (!isSignInLoaded) return;
        try {
          const result = await signIn.create({
            identifier: emailAddress,
            password,
          });
          if (result.createdSessionId) {
            setActiveSignIn({ session: result.createdSessionId });
            router.replace('/home');
          } else {
            setErrorMessage('Additional authentication steps required.');
          }
        } catch (signInErr: any) {
          setErrorMessage('Sign in error: ' + (signInErr.message || ''));
        }
      } else {
        setErrorMessage(err.message || 'An error occurred during sign up.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------------------------
  // Handle verification submission (OTP)
  // ------------------------------------------------
  const onVerifyPress = async () => {
    if (!isSignUpLoaded) return;
    try {
      setErrorMessage('');
      setIsLoading(true);

      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });
      if (signUpAttempt.status === 'complete') {
        // Verification success
        setActiveSignUp({ session: signUpAttempt.createdSessionId });
        router.replace('/home');
      } else {
        setErrorMessage('Verification failed. Please check your code and try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during verification.');
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
        <Text style={styles.title}>Verify Your Email</Text>
        {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Verification code"
          placeholderTextColor="#999"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={onVerifyPress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // ------------------------------------------------
  // Normal sign-up form (no pending verification)
  // ------------------------------------------------
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Create an account</Text>
      {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

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

      <TouchableOpacity style={styles.button} onPress={onSignUpPress} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      {/* Example "Already have an account?" */}
      <View style={styles.footer}>
        <Text>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.link}> Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ------------------------------------------------
// Styles
// ------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    padding: 16,
  },
  title: { marginTop: 40, fontSize: 28, fontWeight: 'bold' },
  error: { color: 'red', marginVertical: 8 },
  input: {
    width: '90%',
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 8,
  },
  button: {
    width: '90%',
    height: 48,
    backgroundColor: 'blue',
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  footer: { flexDirection: 'row', marginTop: 16 },
  link: { color: 'blue' },
});
