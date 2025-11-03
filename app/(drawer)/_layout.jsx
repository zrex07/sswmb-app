import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useContext, useState } from "react";
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from "react-native";
import FacialVerification from "../../components/FacialVerification";
import { AuthContext } from "../../context/AuthContext";

function CustomDrawerContent(props) {
  const { user, logout, isVerified } = useContext(AuthContext);
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showFaceScan, setShowFaceScan] = useState(false);

  const handleLogoutClick = () => {
    // Always require facial verification for logout to ensure same user
    Alert.alert(
      "Confirm Logout",
      "Facial verification is required to ensure secure logout.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Verify & Logout",
          onPress: () => {
            setShowFaceScan(true);
          }
        }
      ]
    );
  };

  const handleDirectLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      router.replace("/");
    } catch (err) {
      Alert.alert("Logout Failed", err.message || "Something went wrong");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleFaceScanSuccess = async () => {
    // Wait a moment to show success message, then logout
    setTimeout(() => {
      handleDirectLogout();
      setShowFaceScan(false);
    }, 1500);
  };

  const handleFaceScanClose = () => {
    setShowFaceScan(false);
  };

  const handleFaceScanFailure = () => {
    Alert.alert(
      "Verification Failed",
      "Face verification failed. Please try again or contact administrator.",
      [
        {
          text: "Try Again",
          onPress: () => setShowFaceScan(true),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  return (
    <>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }} className="bg-gray-50">
        <View className="items-center border-b border-gray-300 pb-4 mb-3 mt-2">
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
            className="w-20 h-20 rounded-full mb-2"
          />
          <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>
            {user?.email || "Guest User"}
          </Text>
          {/* Show verification status */}
          <Text className={`text-sm mt-1 ${isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
            {isVerified ? '✓ Verified' : '⚠ Not Verified'}
          </Text>
        </View>

        <DrawerItemList {...props} />

        <View className="border-t border-gray-300 my-3 mx-4" />

        <TouchableOpacity
          onPress={handleLogoutClick}
          disabled={loggingOut}
          className="bg-red-100 mx-4 mt-auto rounded-xl p-3 mb-6"
        >
          {loggingOut ? (
            <ActivityIndicator color="#dc2626" />
          ) : (
            <Text className="text-red-600 font-bold text-center">
              Logout (Verification Required)
            </Text>
          )}
        </TouchableOpacity>
      </DrawerContentScrollView>

      {/* Facial Verification for Logout */}
      <FacialVerification
        visible={showFaceScan}
        onClose={handleFaceScanClose}
        onSuccess={handleFaceScanSuccess}
        onFailure={handleFaceScanFailure}
        title="Logout Verification"
        description="Verify your identity to ensure secure logout"
        successMessage="✓ Logout Verification Successful!"
        showCancelButton={true}
      />
    </>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#000",
        drawerActiveTintColor: "#000",
        drawerLabelStyle: { fontSize: 16 },
        swipeEnabled: true,
        headerBackVisible: false,
      }}
    >
      <Drawer.Screen
        name="dashboard"
        options={{
          drawerLabel: "Dashboard",
          title: "Dashboard",
          headerBackVisible: false,
        }}
      />

      {/* <Drawer.Screen
        name="changepassword"
        options={{
          drawerLabel: "Change Password",
          title: "Change Password",
          headerBackVisible: false,
        }}
      /> */}
    </Drawer>
  );
}