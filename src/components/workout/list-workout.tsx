import { getDateTime } from "@/helpers/dates";
import React from "react";
import { Text, View } from "react-native";

export const DataWorkoutHistoryView = React.memo(({ data }: any) => {
  // const { data: userClub, isLoading: isLoadingUserClub } = useUserClub();
  return (
    <View className="mt-4" key={data._id.toString()}>
      <Text className="text-gray-500 text-xs mb-2">
        {getDateTime(data.workout_date)}
      </Text>

      <View className="bg-white rounded-xl p-3">
        <View className="flex-row justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <View>
            <Text className="text-sm font-semibold text-gray-800">
              {data.club.club_name}
            </Text>
            <Text className="text-xs text-gray-400">
              {new Date(data.workout_date).toLocaleTimeString()}{" "}
            </Text>
          </View>

          <View className="bg-purple-100 px-3 py-1 rounded-full">
            <Text className="text-xs text-purple-600">Workout</Text>
          </View>
        </View>
      </View>
    </View>
  );
});
