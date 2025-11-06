import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import FacialVerification from '../components/FacialVerification';
import { useAuth } from '../context/AuthContext';

export default function PictorialEvidence() {
  const [showFaceScan, setShowFaceScan] = useState(true); // Show face scan immediately
  const [showAttendanceOptions, setShowAttendanceOptions] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const { user, markAsVerified } = useAuth();

  // Show location alert when component mounts
  useEffect(() => {
    if (showLocationAlert) {
      Alert.alert(
        '📍 Location Required',
        'Please turn on the location for better task tracking and verification.',
        [
          {
            text: 'OK',
            onPress: () => setShowLocationAlert(false),
          },
        ],
        { cancelable: false }
      );
    }
  }, [showLocationAlert]);

  const handleFaceScanSuccess = () => {
    // Mark user as verified and show attendance options
    markAsVerified();
    setVerificationSuccess(true);
    
    // After showing success message for 2 seconds, show attendance options
    setTimeout(() => {
      setVerificationSuccess(false);
      setShowFaceScan(false);
      setShowAttendanceOptions(true);
    }, 2000);
  };

  const handleFaceScanClose = () => {
    // If user cancels face scan, log them out
    Alert.alert(
      'Scan Cancelled',
      'Facial verification is required to continue.',
      [
        {
          text: 'Retry',
          onPress: () => setShowFaceScan(true),
        },
        {
          text: 'Logout',
          onPress: () => {
            router.replace('/');
          },
        },
      ]
    );
  };

  const handlePresent = () => {
    // User is present - go to dashboard
    Alert.alert(
      'Attendance Marked',
      'Your attendance has been marked as PRESENT.',
      [
        {
          text: 'Continue to Dashboard',
          onPress: () => {
            router.replace('/(drawer)/dashboard');
          },
        },
      ]
    );
  };

  const handleLeave = () => {
    // User is on leave
    Alert.alert(
      'Leave Marked',
      'Your attendance has been marked as LEAVE.',
      [
        {
          text: 'Continue to Dashboard',
          onPress: () => {
            router.replace('/(drawer)/dashboard');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Show success message temporarily */}
      {verificationSuccess && (
        <View className="flex-1 justify-center items-center bg-green-100">
          <Text className="text-2xl font-bold text-green-800 mb-4">
            ✓ Verification Successful!
          </Text>
          <Text className="text-lg text-green-700 text-center">
            Redirecting to attendance options...
          </Text>
        </View>
      )}

      {/* Show attendance options after success message */}
      {showAttendanceOptions && !verificationSuccess && (
        <View className="flex-1 justify-center items-center bg-white p-5">
          <Text className="text-black text-2xl font-bold mb-8 text-center">
            Mark Your Attendance
          </Text>

          <Text className="text-black text-lg text-center mb-10 px-4">
            Please select your attendance status for today
          </Text>

          {/* Present Button */}
          <TouchableOpacity
            onPress={handlePresent}
            className="bg-green-500 w-4/5 py-5 rounded-xl mb-4 items-center"
          >
            <Text className="text-white font-bold text-xl">
              Present
            </Text>
            <Text className="text-white text-sm mt-1">
              I am available for work today
            </Text>
          </TouchableOpacity>

          {/* Leave Button */}
          <TouchableOpacity
            onPress={handleLeave}
            className="bg-yellow-500 w-4/5 py-5 rounded-xl items-center"
          >
            <Text className="text-white font-bold text-xl">
              Leave
            </Text>
            <Text className="text-white text-sm mt-1">
              I am on leave today
            </Text>
          </TouchableOpacity>

          {/* Info Text */}
          <Text className="text-black text-center mt-10 px-4">
            Your attendance status will be recorded in the system
          </Text>
        </View>
      )}

      {/* Show loading state when waiting for face scan */}
      {!verificationSuccess && !showAttendanceOptions && (
        <View className="flex-1 justify-center items-center bg-gray-800">
          <Text className="text-white text-lg mb-4">Preparing facial verification...</Text>
          <Text className="text-gray-400 text-center px-4">
            Please wait while we set up the camera for identity verification
          </Text>
        </View>
      )}

      {/* Facial Verification Modal - Show immediately after login */}
      <FacialVerification
        visible={showFaceScan}
        onClose={handleFaceScanClose}
        onSuccess={handleFaceScanSuccess}
        title="Login Verification"
        description="Verify your identity to continue"
        successMessage="✓ Login Verification Successful!"
        showCancelButton={true}
      />
    </View>
  );
}