import ContainerPage from "@/components/ui/container-page";
import DateMonthPickerModal from "@/components/ui/date-month-picker-modal";
import MenuItem from "@/components/ui/menu-item";
import { WorkoutHistoryTimeline } from "@/components/workout/workout-history-timeline";
import { useAuth } from "@/context/auth";
import { useWorkoutHistory } from "@/hooks/useWorkout";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

interface SelectedPeriod {
  year: number;
  month: number;
  month_value: string;
}

const getCurrentPeriod = (): SelectedPeriod => {
  const currentDate = new Date();

  return {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    month_value: currentDate.toLocaleString("id-ID", { month: "long" }),
  };
};

export default function AttendanceScreen() {
  const { user } = useAuth();
  const {
    mutate: loadWorkoutHistory,
    data: workoutHistory,
    isPending,
    isError,
  } = useWorkoutHistory();
  const [selectedPeriod, setSelectedPeriod] =
    useState<SelectedPeriod>(getCurrentPeriod);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const joinedYear = new Date(user.created_at).getFullYear();

  useEffect(() => {
    loadWorkoutHistory({
      year: selectedPeriod.year,
      month: selectedPeriod.month - 1,
    });
  }, [loadWorkoutHistory, selectedPeriod]);

  const handleSelectPeriod = (period: SelectedPeriod): void => {
    setSelectedPeriod(period);
    setIsDatePickerVisible(false);
  };

  const workouts = workoutHistory?.response ?? [];

  return (
    <>
      <ContainerPage titleHeader="Workout" titleContent={user.name}>
        <ScrollView
          contentContainerClassName="pb-32"
          showsVerticalScrollIndicator={false}
        >
          <MenuItem
            icon="calendar-outline"
            title={`${selectedPeriod.month_value} - ${selectedPeriod.year}`}
            isBottom
            onPress={() => setIsDatePickerVisible(true)}
          />

          {workoutHistory && (
            <View className="mt-4 rounded-2xl bg-purple-50 p-4">
              <Text className="text-xs font-semibold uppercase tracking-wide text-purple-500">
                Ringkasan Periode
              </Text>
              <View className="mt-3 flex-row">
                <View className="flex-1">
                  <Text className="text-xs text-slate-400">
                    Workout {selectedPeriod.month_value}
                  </Text>
                  <Text className="mt-1 text-2xl font-bold text-purple-600">
                    {workoutHistory.total_workout_per_month}
                  </Text>
                </View>
                <View className="mx-4 w-px bg-purple-100" />
                <View className="flex-1">
                  <Text className="text-xs text-slate-400">Total Workout</Text>
                  <Text className="mt-1 text-2xl font-bold text-purple-600">
                    {workoutHistory.total}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View className="mb-5 mt-7">
            <Text className="text-xl font-bold text-slate-900">
              Riwayat Workout
            </Text>
            <Text className="mt-1 text-sm leading-5 text-slate-500">
              Daftar workout pada periode {selectedPeriod.month_value}{" "}
              {selectedPeriod.year}.
            </Text>
          </View>

          {isPending && !workoutHistory ? (
            <ActivityIndicator
              size="large"
              color="#6F3FA0"
              style={{ marginTop: 36 }}
            />
          ) : isError && !workoutHistory ? (
            <View className="items-center rounded-3xl border border-red-100 bg-red-50 px-6 py-10">
              <Text className="text-lg font-bold text-red-700">
                Riwayat workout gagal dimuat
              </Text>
              <Text className="mt-2 text-center text-sm text-red-600">
                Pilih kembali periode untuk mencoba memuat data.
              </Text>
            </View>
          ) : (
            <WorkoutHistoryTimeline
              workouts={workouts}
              summaryLabel={`Workout ${selectedPeriod.month_value}`}
              emptyDescription={`Belum ada workout pada ${selectedPeriod.month_value} ${selectedPeriod.year}.`}
            />
          )}

          {isPending && workoutHistory && (
            <ActivityIndicator
              size="small"
              color="#6F3FA0"
              style={{ marginVertical: 20 }}
            />
          )}
        </ScrollView>
      </ContainerPage>

      <DateMonthPickerModal
        visible={isDatePickerVisible}
        joined_year={joinedYear}
        selectedYear={selectedPeriod.year}
        selectedMonth={selectedPeriod.month}
        onCancel={() => setIsDatePickerVisible(false)}
        onSelect={handleSelectPeriod}
      />
    </>
  );
}
