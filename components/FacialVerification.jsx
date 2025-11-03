import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Text, TouchableOpacity, View } from 'react-native';

export default function FacialVerification({ 
  visible, 
  onClose, 
  onSuccess, 
  onFailure,
  title = "Facial Verification",
  description = "Please position your face in the frame and ensure good lighting",
  successMessage = "✓ Verification Successful!",
  showCancelButton = true
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const cameraRef = useRef(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      setIsScanning(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
        });

        await simulateFacialRecognition(photo);
        
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
        setIsScanning(false);
        onFailure?.();
      }
    }
  };

  const simulateFacialRecognition = async (photo) => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const isSuccess = Math.random() > 0.2;

    if (isSuccess) {
      setScanResult('success');
      onSuccess?.();
    } else {
      setScanResult('failed');
      setIsScanning(false);
      onFailure?.();
    }
  };

  const retryScan = () => {
    setScanResult(null);
    setIsScanning(false);
  };

  const handleClose = () => {
    setScanResult(null);
    setIsScanning(false);
    onClose?.();
  };

  // Reset state when modal becomes visible
  const handleModalShow = () => {
    if (visible) {
      setScanResult(null);
      setIsScanning(false);
    }
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted && visible) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 justify-center items-center bg-white p-5">
          <Text className="text-lg text-center mb-4">
            We need your permission to use the camera for facial verification
          </Text>
          <TouchableOpacity 
            onPress={requestPermission}
            className="bg-blue-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleClose}
            className="bg-gray-500 px-6 py-3 rounded-lg mt-4"
          >
            <Text className="text-white font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible && permission.granted}
      animationType="slide"
      presentationStyle="pageSheet"
      onShow={handleModalShow}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black">
        {scanResult === 'success' ? (
          <View className="flex-1 justify-center items-center bg-green-100">
            <Text className="text-2xl font-bold text-green-800 mb-4">
              {successMessage}
            </Text>
            <Text className="text-lg text-green-700 text-center">
              Verification completed successfully!
            </Text>
            <ActivityIndicator size="large" color="#16a34a" className="mt-4" />
          </View>
        ) : (
          <View className="flex-1">
            <CameraView 
              ref={cameraRef}
              style={{ flex: 1 }}
              facing="front"
              mode="picture"
            />
            
            {/* Overlay content with absolute positioning */}
            <View className="absolute inset-0 bg-transparent justify-end pb-10">
              {/* Header */}
              <View className="absolute top-16 left-0 right-0 items-center">
                <Text className="text-white text-xl font-bold mb-2">
                  {title}
                </Text>
                <Text className="text-white text-center px-5">
                  {description}
                </Text>
              </View>

              {/* Face guide frame */}
              <View className="absolute top-1/3 left-5 right-5 items-center justify-center">
                <View className="w-64 h-64 border-2 border-white rounded-2xl bg-transparent" />
              </View>

              {/* Bottom controls */}
              <View className="items-center px-5 mb-8">
                {isScanning ? (
                  <View className="items-center">
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text className="text-white mt-4 text-lg">
                      Scanning your face...
                    </Text>
                  </View>
                ) : scanResult === 'failed' ? (
                  <View className="items-center">
                    <Text className="text-red-400 text-lg font-bold mb-4">
                      Face recognition failed
                    </Text>
                    <Text className="text-white text-center mb-4">
                      Please ensure your face is clearly visible and try again
                    </Text>
                    <View className="flex-row space-x-4">
                      <TouchableOpacity 
                        onPress={handleClose}
                        className="bg-gray-500 px-6 py-3 rounded-full"
                      >
                        <Text className="text-white font-semibold">
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={retryScan}
                        className="bg-red-500 px-6 py-3 rounded-full"
                      >
                        <Text className="text-white font-semibold">
                          Try Again
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View className="items-center w-full">
                    <TouchableOpacity 
                      onPress={takePicture}
                      disabled={isScanning}
                      className="bg-white px-8 py-4 rounded-full mb-4 w-full items-center"
                    >
                      <Text className="text-black font-semibold text-lg">
                        Scan Face
                      </Text>
                    </TouchableOpacity>
                    {showCancelButton && (
                      <TouchableOpacity 
                        onPress={handleClose}
                        className="bg-gray-600 px-6 py-3 rounded-full"
                      >
                        <Text className="text-white font-semibold">
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}