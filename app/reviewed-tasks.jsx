import { useLocalSearchParams } from "expo-router";
import { useContext } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { TaskContext } from "../context/TaskContext";

export default function ReviewedTasks() {
  const { category } = useLocalSearchParams();
  const { reviewedTasks } = useContext(TaskContext);

  const filteredTasks = category
    ? reviewedTasks.filter((t) => t.category === category)
    : reviewedTasks;

  if (filteredTasks.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500 text-lg">No reviewed tasks found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-gray-100 p-4 rounded-2xl mb-4 flex-row items-center">
            <Image
              source={require("../assets/images/test.jpg")}
              className="w-16 h-16 rounded-xl mr-4"
            />
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                {item.title}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                {item.zone_name}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
