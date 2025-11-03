import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function ForgetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleResetPassword = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // Simulate API call for password reset
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful reset
      setSuccess("Password reset link has been sent to your email!");
      setEmail("");

      // Show success alert
      Alert.alert(
        "Reset Link Sent",
        "Please check your email for the password reset link.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );

    } catch (err) {
      setError("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white px-6"
    >
      <View className="flex-1 justify-center">
        {/* Header */}
        <View className="items-center mb-8">
          <Image
            source={require("../assets/images/SSWMB.png")}
            className="w-[150px] h-[120px] mb-4"
            resizeMode="contain"
          />
          <Text className="text-2xl font-extrabold mb-2">SSWMB</Text>
          <Text className="text-xl font-semibold text-gray-700">
            Reset Your Password
          </Text>
        </View>

        {/* Instructions */}
        <Text className="text-gray-600 text-center mb-6 px-4">
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Email Address</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#6B7280"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />
        </View>

        {/* Error Message */}
        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <Text className="text-red-700 text-center">{error}</Text>
          </View>
        ) : null}

        {/* Success Message */}
        {success ? (
          <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <Text className="text-green-700 text-center">{success}</Text>
          </View>
        ) : null}

        {/* Reset Password Button */}
        <TouchableOpacity
          onPress={handleResetPassword}
          disabled={loading}
          className={`w-full py-4 rounded-lg mb-4 items-center ${
            loading ? "bg-gray-400" : "bg-green-600"
          }`}
        >
          {loading ? (
            <View className="flex-row items-center">
              <Ionicons name="reload-outline" size={20} color="#fff" />
              <Text className="text-white font-semibold ml-2">Sending...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-lg">
              Send Reset Link
            </Text>
          )}
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          onPress={handleBackToLogin}
          className="w-full py-3 rounded-lg border border-gray-300 items-center"
        >
          <Text className="text-gray-700 font-medium">Back to Login</Text>
        </TouchableOpacity>

        {/* Additional Help */}
        <View className="mt-8 p-4 bg-blue-50 rounded-lg">
          <Text className="text-blue-800 text-sm text-center">
            💡 If you don't receive the email within a few minutes, please check your spam folder.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}