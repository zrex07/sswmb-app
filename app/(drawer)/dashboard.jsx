import { useRouter } from "expo-router";
import { useContext } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import * as Progress from "react-native-progress";
import { TaskContext } from "../../context/TaskContext";

export default function Dashboard() {
  const { tasks, reviewedTasks, getCategories, getCountsForCategory } = useContext(TaskContext);
  const router = useRouter();



  // Calculate overall progress
  const totalTasks = tasks.length + reviewedTasks.length;
  const totalReviewed = reviewedTasks.length;
  const overallProgress = totalTasks > 0 ? totalReviewed / totalTasks : 0;

  // Get categories in fixed order
  const categories = getCategories();

  return (
    <View className="flex-1 bg-white px-5">
      <ScrollView 
        showsVerticalScrollIndicator={false}
      > 
        {/* Logo and Circular Progress Side by Side */}
        <View className="flex-row items-center justify-between my-8">
          {/* Logo on the left */}
          <View className="flex-1 items-center mb-3">
            <Image
              source={require("../../assets/images/SSWMB.png")}
              className="w-[250px] h-[170px]"
              resizeMode="contain"
            />

            <Text className="mt-[-40px] text-gray-700 text-md font-semibold text-center">
              SSWMB
            </Text>
          </View>
          
          {/* Circular Progress on the right */}
          <View className="flex-1 items-center">
            <Progress.Circle
              size={110}
              progress={overallProgress}
              showsText
              color="#22c55e"
              unfilledColor="#E5E7EB"
              borderWidth={0}
              thickness={10}
              formatText={() => `${Math.round(overallProgress * 100)}%`}
            />
            <Text className="mt-3 text-gray-700 text-md font-semibold text-center">
              {totalReviewed} of {totalTasks} Tasks Reviewed
            </Text>
          </View>
        </View>

        {/* Categories Section */}
        <Text className="text-xl font-semibold text-gray-700 mb-3">
          Task Categories
        </Text>

        {categories.map((category) => {
          const { total, reviewed, pending, progress } = getCountsForCategory(category);
          const progressPercent = Math.round(progress * 100);

          return (
            <View
              key={category}
              className="bg-[#B5E4FF] rounded-2xl p-4 mb-6 shadow-sm"
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold text-gray-800">
                  {category}
                </Text>
                <Text className="text-sm text-gray-500">
                  {reviewed}/{total}
                </Text>
              </View>

              {/* Horizontal Progress Bar with Percentage */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1 mr-3">
                  <View className="w-full h-3 bg-gray-200 rounded-full">
                    <View
                      className="h-3 bg-green-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </View>
                </View>
                <Text className="text-sm font-semibold text-gray-700">
                  {progressPercent}%
                </Text>
              </View>

              {/* Pending & Reviewed Buttons with counts */}
              <View className="flex-row justify-between">
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/categories-tasks",
                      params: { category, tab: "pending" },
                    })
                  }
                  className="flex-1 bg-yellow-400 py-3 rounded-xl mr-2"
                >
                  <Text className="text-center text-white font-semibold">
                    Unreviewed ({pending})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/categories-tasks",
                      params: { category, tab: "reviewed" },
                    })
                  }
                  className="flex-1 bg-green-500 py-3 rounded-xl ml-2"
                >
                  <Text className="text-center text-white font-semibold">
                    Reviewed ({reviewed})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        
        {/* Add extra space at the bottom */}
        <View className="h-11" />
      </ScrollView>
    </View>
  );
}