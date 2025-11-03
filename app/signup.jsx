import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function Signup() {
  const router = useRouter();
  const { signUp = () => ({ error: null }), loading = false } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleSignup = async () => {
    try {
      setError("");

      if (!email || !password || !confirmPassword) {
        setError("All fields are required.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (password.length < 6) {
        setError("Password should be at least 6 characters.");
        return;
      }

      setSignupLoading(true);
      const { error: signupError } = await signUp(email, password);
      
      if (!isMounted) return;

      if (signupError) {
        setError(signupError || "Signup failed. Please try again.");
      } else {
        Alert.alert(
          "Success",
          "Account created! Please verify your email before logging in."
        );
        router.replace("/");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error('Signup error:', err);
    } finally {
      if (isMounted) {
        setSignupLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior='padding'
      className="flex-1 justify-center items-center bg-white px-6"
    >
      <Image
        source={require("../assets/images/SSWMB.png")}
        className="w-[200px] h-[150px] mb-2"
        resizeMode="contain"
      />

      <Text className="text-2xl font-extrabold mb-4">SSWMB</Text>
      <Text className="text-xl font-semibold mb-4">Create a new account</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#6B7280"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#6B7280"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        style={{
            color: "#000",
            fontFamily: Platform.OS === "android" ? "sans-serif" : undefined,
            paddingRight: 50,
          }}
        className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4"
      />

      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor="#6B7280"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        style={{
            color: "#000",
            fontFamily: Platform.OS === "android" ? "sans-serif" : undefined,
            paddingRight: 50,
          }}
        className="w-full border border-gray-300 rounded-md px-4 py-4 mb-4"
      />

      {error ? <Text className="text-red-500 mb-4">{error}</Text> : null}

      <TouchableOpacity
        onPress={handleSignup}
        disabled={signupLoading || loading}
        className={`w-full rounded-md py-3 ${
          signupLoading ? "bg-gray-400" : "bg-green-600"
        }`}
      >
        {signupLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center text-white font-bold text-lg">
            Sign Up
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/")}>
        <Text className="text-green-600 mt-4 text-center">
          Already have an account? Log in
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}