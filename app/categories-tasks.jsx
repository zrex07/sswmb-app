import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import * as Progress from "react-native-progress";
import { SafeAreaView } from "react-native-safe-area-context";
import { TaskContext } from "../context/TaskContext";

export default function CategoriesTasks() {
  const { category: paramCategory, tab: initialTab } = useLocalSearchParams();
  const router = useRouter();
  const { getPending, getReviewed, getCountsForCategory, loading } = useContext(TaskContext);

  const category = paramCategory || "";
  const [tab, setTab] = useState(initialTab === "reviewed" ? "reviewed" : "unreviewed");

  const unreviewed = useMemo(() => getPending(category), [getPending, category, loading]);
  const reviewed = useMemo(() => getReviewed(category), [getReviewed, category, loading]);

  const { total, reviewed: reviewedCount, unreviewed: pendingCount, progress } = getCountsForCategory(category);

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const [d, m, y] = dateString.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#157D42" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-6 py-6">
      <Text className="text-2xl font-bold text-gray-800 mb-4">{category}</Text>

      {/* Header with counts & small progress */}
      <View className="mb-4 bg-gray-50 p-4 rounded-2xl flex-row justify-between items-center">
        <View>
          <Text className="text-gray-700 font-semibold">{reviewedCount} reviewed</Text>
          <Text className="text-gray-500 text-sm">{pendingCount} unreviewed • {total} total</Text>
        </View>
        <View className="items-end">
          <Progress.Bar progress={progress} width={120} height={10} color="#157D42" unfilledColor="#E5E7EB" borderWidth={0} />
          <Text className="text-xs text-gray-600 mt-1">{Math.round(progress * 100)}%</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row mb-4">
        <TouchableOpacity
          onPress={() => setTab("unreviewed")}
          className={`flex-1 py-3 rounded-l-2xl ${tab === "unreviewed" ? "bg-yellow-400" : "bg-gray-100" } items-center`}
        >
          <Text className={`${tab === "unreviewed" ? "text-white" : "text-gray-700"} font-semibold`}>Unreviewed ({unreviewed.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("reviewed")}
          className={`flex-1 py-3 rounded-r-2xl ${tab === "reviewed" ? "bg-green-600" : "bg-gray-100" } items-center`}
        >
          <Text className={`${tab === "reviewed" ? "text-white" : "text-gray-700"} font-semibold`}>Reviewed ({reviewed.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {tab === "unreviewed" ? (
        <FlatList
          data={unreviewed}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/taskDetails", params: { id: item.id } })}
              className="bg-yellow-400 rounded-xl p-4 mb-4"
            >
              <Text className="text-white text-lg font-semibold">{item.title}</Text>
              <Text className="text-white text-sm mt-1">{item.zone_name}</Text>
              <Text className="text-white text-xs mt-1">{formatDate(item.created_at)}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text className="text-gray-500 text-center mt-6">No unreviewed tasks in this category.</Text>}
        />
      ) : (
        <FlatList
          data={reviewed}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="bg-green-500 rounded-xl p-4 mb-4">
              <Text className="text-white text-lg font-semibold">{item.title}</Text>
              <Text className="text-white text-sm mt-1">{item.zone_name}</Text>
              <Text className="text-white text-xs mt-1">Reviewed: {item.reviewed_at ? new Date(item.reviewed_at).toLocaleString() : "—"}</Text>
              {item.comment ? <Text className="text-white mt-2">{item.comment}</Text> : null}
            </View>
          )}
          ListEmptyComponent={<Text className="text-gray-500 text-center mt-6">No reviewed tasks in this category.</Text>}
        />
      )}
    </SafeAreaView>
  );
}