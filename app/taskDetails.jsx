import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TaskContext } from "../context/TaskContext";

const USER_ACTIONS = {
  AGREE: 'agree',
  DISAGREE: 'disagree',
};

const PERCENTAGES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// Extracted PercentageRating component
const PercentageRating = ({ percentage, onPercentageChange }) => (
  <View className="mb-6">
    <Text className="text-lg font-semibold mb-4 text-center">Please rate the task (10% to 100%)</Text>
    {[0, 5].map((start) => (
      <View key={start} className="flex-row flex-wrap justify-between mb-2">
        {PERCENTAGES.slice(start, start + 5).map((percent) => (
          <TouchableOpacity
            key={percent}
            onPress={() => onPercentageChange(percent)}
            className={`w-[18%] py-3 rounded-xl items-center ${
              percentage === percent ? 'bg-blue-600' : 'bg-blue-500'
            }`}
          >
            <Text className="text-white font-semibold text-sm">{percent}%</Text>
          </TouchableOpacity>
        ))}
      </View>
    ))}
    <Text className="text-center text-gray-600 mt-2">
      {percentage === 0 ? "Tap a percentage to rate" : `${percentage}% selected`}
    </Text>
  </View>
);

export default function TaskDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { submitTask, tasks } = useContext(TaskContext);

  // find the task in the full list
  const task = tasks.find((t) => String(t.id) === String(id));
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [userAction, setUserAction] = useState(null); // 'agree' or 'disagree' or null

  // Check if this task requires special Agree/Disagree flow
  const isSpecialCategory = task?.category === "Manual Sweeping" || task?.category === "Mechanical Sweeping";

  if (!task) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Task not found</Text>
      </View>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const [d, m, y] = dateString.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const handleSubmit = async (finalComment = comment, finalPercentage = percentage) => {
    // Validation for special categories
    if (isSpecialCategory) {
      if (userAction === USER_ACTIONS.AGREE && finalPercentage === 0) {
        Alert.alert("Rating Required", "Please provide a percentage rating before submitting.");
        return;
      }

      if (userAction === USER_ACTIONS.DISAGREE && !finalComment.trim()) {
        Alert.alert("Comment Required", "Please add a comment before submitting.");
        return;
      }
    } else {
      // Validation for other categories - comment is always required
      if (!userAction) {
        Alert.alert("Action Required", "Please select Agree or Disagree before submitting.");
        return;
      }

      if (!finalComment.trim()) {
        Alert.alert("Comment Required", "Please add a comment before submitting.");
        return;
      }
    }

    setLoading(true);
    try {
      // Create comment with percentage if applicable
      let fullComment = finalComment;
      if (isSpecialCategory && userAction === USER_ACTIONS.AGREE && finalPercentage > 0) {
        fullComment = `Agreed - ${finalPercentage}% rating${finalComment ? ` - ${finalComment}` : ''}`;
      } else if (userAction === USER_ACTIONS.AGREE) {
        fullComment = `Agreed - ${finalComment}`;
      } else if (userAction === USER_ACTIONS.DISAGREE) {
        fullComment = `Disagreed - ${finalComment}`;
      }

      const res = submitTask(task.id, fullComment);
      if (res && res.error) throw new Error(res.error);
      Alert.alert("Success", "Task marked as reviewed.");
      router.back();
    } catch (err) {
      console.error("Error reviewing task:", err);
      Alert.alert("Error", "Failed to review task.");
    } finally {
      setLoading(false);
    }
  };

  const handleAgree = () => {
    setUserAction(USER_ACTIONS.AGREE);
  };

  const handleDisagree = () => {
    setUserAction(USER_ACTIONS.DISAGREE);
  };

  const imageSource = () => {
    if (task.image_url && typeof task.image_url === "string" && task.image_url.startsWith("http")) return { uri: task.image_url };
    // fallback local asset — adjust path if needed
    return require("../assets/images/test.jpg");
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6 py-4">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text className="text-2xl font-semibold text-gray-800 mb-4">{task.title}</Text>

          <Text className="text-gray-700 mb-2 font-semibold">{task.zone_name}</Text>
          <Text className="text-gray-700 mb-4 font-semibold">{formatDate(task.created_at)}</Text>

          {task.image_url ? (
            <>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Image source={imageSource()} className="w-full h-48 mb-4 rounded-xl" resizeMode="cover" />
              </TouchableOpacity>

              <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" }}>
                  <TouchableOpacity style={{ position: "absolute", top: 50, right: 20 }} onPress={() => setModalVisible(false)}>
                    <Text style={{ color: "#fff", fontSize: 18 }}>Close</Text>
                  </TouchableOpacity>
                  <Image source={imageSource()} style={{ width: "90%", height: "80%", resizeMode: "contain" }} />
                </View>
              </Modal>
            </>
          ) : (
            <View className="w-full h-48 mb-4 rounded-xl bg-gray-200 items-center justify-center">
              <Text className="text-gray-500">No Image Available</Text>
            </View>
          )}

          {/* If already reviewed, show read-only information */}
          {task.complete ? (
            <>
              <Text className="text-lg font-semibold mb-2">Review</Text>
              <View className="border border-gray-200 rounded-xl p-3 mb-4">
                <Text className="text-gray-700 mb-2">Comment:</Text>
                <Text className="text-gray-800">{task.comment || "—"}</Text>
                <Text className="text-gray-500 text-xs mt-3">Reviewed at: {task.reviewed_at ? new Date(task.reviewed_at).toLocaleString() : "—"}</Text>
              </View>
            </>
          ) : (
            <>
              {/* Special flow for Manual Sweeping and Mechanical Sweeping */}
              {isSpecialCategory ? (
                <View>
                  <Text className="text-lg font-semibold mb-4 text-center">How would you rate this task?</Text>
                  
                  {/* Agree/Disagree Buttons - Only show if no action selected yet */}
                  {!userAction && (
                    <View className="flex-row justify-between mb-6">
                      <TouchableOpacity 
                        onPress={handleAgree}
                        className="flex-1 bg-green-500 py-4 rounded-xl mr-2 items-center"
                      >
                        <Text className="text-white font-semibold text-lg">Agree ✓</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        onPress={handleDisagree}
                        className="flex-1 bg-red-500 py-4 rounded-xl ml-2 items-center"
                      >
                        <Text className="text-white font-semibold text-lg">Disagree ✗</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Percentage Rating - Show when user selects Agree */}
                  {userAction === USER_ACTIONS.AGREE && (
                    <View className="mb-6">
                      <PercentageRating percentage={percentage} onPercentageChange={setPercentage} />
                      
                      <TouchableOpacity 
                        disabled={loading || percentage === 0} 
                        onPress={() => handleSubmit(comment, percentage)}
                        className={`py-3 rounded-xl ${loading || percentage === 0 ? "bg-gray-400" : "bg-green-500"}`}
                      >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-center font-semibold">Submit Rating</Text>}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Comment Box - Show when user selects Disagree */}
                  {userAction === USER_ACTIONS.DISAGREE && (
                    <View className="mb-6">
                      <Text className="text-lg font-semibold mb-2">Please provide feedback</Text>
                      {/* <Text className="text-gray-600 mb-3">Why do you disagree with this work?</Text> */}
                      <TextInput
                        placeholderTextColor="#6B7280"
                        multiline
                        value={comment}
                        onChangeText={setComment}
                        textAlignVertical="top"
                        className="border border-gray-300 rounded-xl text-gray-700 min-h-[120px] px-3 py-2 mb-4"
                      />
                      
                      <TouchableOpacity 
                        disabled={loading || !comment.trim()} 
                        onPress={() => handleSubmit()}
                        className={`py-3 rounded-xl ${loading || !comment.trim() ? "bg-gray-400" : "bg-red-500"}`}
                      >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-center font-semibold">Submit Feedback</Text>}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ) : (
                /* For other categories: Agree/Disagree buttons + Comment box */
                <View>
                  <Text className="text-lg font-semibold mb-4 text-center">How would you rate this task?</Text>
                  
                  {/* Agree/Disagree Buttons - Always visible for other categories */}
                  <View className="flex-row justify-between mb-6">
                    <TouchableOpacity 
                      onPress={handleAgree}
                      className={`flex-1 py-4 rounded-xl mr-2 items-center ${
                        userAction === USER_ACTIONS.AGREE ? 'bg-green-600' : 'bg-green-500'
                      }`}
                    >
                      <Text className="text-white font-semibold text-lg">Agree ✓</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={handleDisagree}
                      className={`flex-1 py-4 rounded-xl ml-2 items-center ${
                        userAction === USER_ACTIONS.DISAGREE ? 'bg-red-600' : 'bg-red-500'
                      }`}
                    >
                      <Text className="text-white font-semibold text-lg">Disagree ✗</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Comment Box - Always visible for other categories */}
                  <View className="mb-6">
                    <Text className="text-lg font-semibold mb-2">
                      {userAction === USER_ACTIONS.AGREE
                        ? "Additional Comments" 
                        : userAction === USER_ACTIONS.DISAGREE
                        ? "Please provide feedback"
                        : "Comments"}
                    </Text>
                    
                    {/* {userAction === 'disagree' && (
                      <Text className="text-gray-600 mb-3">Why do you disagree with this work?</Text>
                    )} */}
                    
                    <TextInput
                      multiline
                      value={comment}
                      onChangeText={setComment}
                      textAlignVertical="top"
                      className="border border-gray-300 rounded-xl text-gray-700 min-h-[120px] px-3 py-2 mb-4"
                    />
                    
                    <TouchableOpacity 
                      disabled={loading || !comment.trim() || !userAction} 
                      onPress={() => handleSubmit()}
                      className={`py-3 rounded-xl ${
                        loading || !comment.trim() || !userAction 
                          ? "bg-gray-400" 
                          : userAction === USER_ACTIONS.AGREE
                            ? "bg-green-500" 
                            : "bg-red-500"
                      }`}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="text-white text-center font-semibold">
                          Submit {userAction === USER_ACTIONS.AGREE ? 'Review' : 'Feedback'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}