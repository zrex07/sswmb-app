import * as NavigationBar from "expo-navigation-bar";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, BackHandler, Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { TaskProvider } from "../context/TaskContext";
import "../global.css";

// Import Reanimated at the top level
import 'react-native-reanimated';

// Custom hook to handle back button
function useBackButtonHandler() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Android only
    if (Platform.OS !== "android") return;

    const onBackPress = () => {
      // If we're on these screens, navigate back via router and consume the event
      if (pathname === '/categories-tasks' || pathname === '/taskDetails') {
        router.back();
        return true; // prevent default behavior
      }

      // Allow default back behavior for other screens
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [pathname, router]);
}

function RootLayoutNav() {
  const { loading, user } = useAuth();
  useBackButtonHandler(); // Use the back button handler

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setButtonStyleAsync("dark");
    }
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index"
        options={{
          // Prevent going back to this screen after login
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="signup"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="pictorial-evidence" />
      <Stack.Screen 
        name="(drawer)"
        options={{
          // This prevents the drawer from being part of the back stack
          headerShown: false,
        }}
      />
      {/* Other screens that are NOT part of the drawer */}
      <Stack.Screen name="categories-tasks" />
      <Stack.Screen name="reviewed-tasks" />
      <Stack.Screen name="taskDetails" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TaskProvider>
          <StatusBar style="dark" />
          <RootLayoutNav />
        </TaskProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}