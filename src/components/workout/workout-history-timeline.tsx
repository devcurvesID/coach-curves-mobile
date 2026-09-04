import type { WorkoutRecord } from "@/types/workout";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React from "react";
import { Text, View } from "react-native";

interface WorkoutHistoryTimelineProps {
  workouts: WorkoutRecord[];
  target?: number;
  summaryLabel?: string;
  emptyDescription?: string;
  showSequence?: boolean;
  cardOnly?: boolean;
}

const getWorkoutSequenceMap = (workouts: WorkoutRecord[]) => {
  const workoutsByOldestDate = [...workouts].sort((first, second) => {
    const workoutDateDifference =
      dayjs(first.workout_date).valueOf() -
      dayjs(second.workout_date).valueOf();

    if (workoutDateDifference !== 0) return workoutDateDifference;

    return (
      dayjs(first.created_at).valueOf() - dayjs(second.created_at).valueOf()
    );
  });

  return new Map(
    workoutsByOldestDate.map((workout, index) => [workout._id, index + 1]),
  );
};

export const WorkoutHistoryTimeline = ({
  workouts,
  target,
  summaryLabel = "Progress terkumpul",
  emptyDescription = "Selesaikan workout pertama untuk mulai mencatat riwayat.",
  showSequence = true,
  cardOnly = false,
}: WorkoutHistoryTimelineProps) => {
  if (workouts.length === 0) {
    return (
      <View className="items-center rounded-3xl border border-dashed border-purple-200 bg-purple-50/60 px-6 py-10">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-purple-100">
          <MaterialCommunityIcons name="dumbbell" size={30} color="#6F3FA0" />
        </View>
        <Text className="mt-4 text-lg font-bold text-slate-800">
          Belum ada riwayat workout
        </Text>
        <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
          {emptyDescription}
        </Text>
      </View>
    );
  }

  const workoutSequenceMap = getWorkoutSequenceMap(workouts);

  return (
    <View>
      {!cardOnly && (
        <View className="mb-5 flex-row items-center justify-between rounded-2xl bg-purple-50 px-4 py-3.5">
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="chart-timeline-variant-shimmer"
              size={23}
              color="#6F3FA0"
            />
            <Text className="ml-2 font-semibold text-purple-900">
              {summaryLabel}
            </Text>
          </View>
          <View className="rounded-full bg-purple-600 px-3 py-1.5">
            <Text className="text-xs font-bold text-white">
              {target ? `${workouts.length}/${target}` : workouts.length} sesi
            </Text>
          </View>
        </View>
      )}

      {workouts.map((workout, index) => {
        const isLastItem = index === workouts.length - 1;
        const workoutSequence =
          workoutSequenceMap.get(workout._id) ?? index + 1;

        return (
          <View key={workout._id} className={cardOnly ? undefined : "flex-row"}>
            {!cardOnly && (
              <View className="mr-3 items-center">
                <View className="h-11 w-11 items-center justify-center rounded-full border-4 border-purple-100 bg-purple-600">
                  {showSequence ? (
                    <Text className="font-bold text-white">
                      {workoutSequence}
                    </Text>
                  ) : (
                    <MaterialCommunityIcons
                      name="dumbbell"
                      size={19}
                      color="#FFFFFF"
                    />
                  )}
                </View>
                {!isLastItem && (
                  <View className="min-h-12 w-0.5 flex-1 bg-purple-200" />
                )}
              </View>
            )}

            <View className="mb-4 flex-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <View className="flex-row items-start justify-between">
                <View className="mr-3 flex-1">
                  <Text className="text-base font-bold text-slate-900">
                    {showSequence ? `Workout #${workoutSequence}` : "Workout"}
                  </Text>
                  <Text className="mt-1 text-xs font-semibold uppercase tracking-wide text-green-600">
                    Selesai
                  </Text>
                </View>
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-green-50">
                  <Ionicons name="checkmark-circle" size={23} color="#16A34A" />
                </View>
              </View>

              <View className="my-3 h-px bg-slate-100" />

              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={17} color="#64748B" />
                <Text className="ml-2 text-sm font-medium text-slate-600">
                  {dayjs(workout.workout_date).format("DD MMM YYYY")}
                </Text>
                <View className="mx-3 h-1 w-1 rounded-full bg-slate-300" />
                <Ionicons name="time-outline" size={17} color="#64748B" />
                <Text className="ml-1.5 text-sm text-slate-500">
                  {dayjs(workout.created_at).format("HH:mm")}
                </Text>
              </View>

              <View className="mt-2.5 flex-row items-center">
                <Ionicons name="location-outline" size={17} color="#64748B" />
                <Text
                  className="ml-2 flex-1 text-sm text-slate-500"
                  numberOfLines={1}
                >
                  {workout.club?.club_name || "Club belum tersedia"}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};
