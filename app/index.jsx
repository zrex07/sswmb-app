import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    const { error: loginError } = await login(email, password);
    if (loginError) {
      const message =
        typeof loginError === "string"
          ? loginError
          : loginError?.message ?? "Wrong credentials";
      setError(message);
      return;
    }

    // Use replace instead of push to remove login from navigation stack
    router.replace("/pictorial-evidence");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgetPassword = () => {
    router.push("/forget-password");
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

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
      <Text className="text-xl font-semibold mb-4">Login to your account</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#6B7280"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4"
      />

      {/* Password Input with Eye Icon */}
      <View className="w-full relative mb-2">
        <TextInput
          placeholder="Password"
          placeholderTextColor="#6B7280"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          textContentType="password"
          secureTextEntry={!showPassword}
          style={{
            color: "#000",
            fontFamily: Platform.OS === "android" ? "sans-serif" : undefined,
            paddingRight: 50,
          }}
          className="w-full border border-gray-300 rounded-md px-4 py-3"
        />
        
        {/* Eye Icon Button */}
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          className="absolute right-3 top-3"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={showPassword ? "eye-off-outline" : "eye-outline"} 
            size={24} 
            color="#6B7280" 
          />
        </TouchableOpacity>
      </View>

      {/* Forget Password Link */}
      <TouchableOpacity 
        onPress={handleForgetPassword}
        className="self-end mb-4"
      >
        <Text className="text-green-600 text-sm font-medium">
          Forgot Password?
        </Text>
      </TouchableOpacity>

      {error ? (
        <Text className="text-red-500 mb-3">{error}</Text>
      ) : null}

      <TouchableOpacity
        onPress={handleLogin}
        style={{
          width: "100%",
          backgroundColor: "#16A34A",
          padding: 14,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text className="text-green-600 mt-4 text-center mb-2">
          Don't have an account? Sign up
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}