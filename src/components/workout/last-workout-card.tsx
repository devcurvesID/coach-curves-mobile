import type { WorkoutRecord } from "@/types/workout";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface LastWorkoutCardProps {
  workout: WorkoutRecord | null;
  isError?: boolean;
  onRetry: () => void;
}

const formatWorkoutDate = (date?: string): string => {
  const parsedDate = dayjs(date);
  return parsedDate.isValid() ? parsedDate.format("DD MMM YYYY") : "-";
};

const formatWorkoutTime = (date?: string): string => {
  const parsedDate = dayjs(date);
  return parsedDate.isValid() ? parsedDate.format("HH:mm") : "-";
};

export const LastWorkoutCard = ({
  workout,
  isError = false,
  onRetry,
}: LastWorkoutCardProps) => {
  if (isError) {
    return (
      <View className="items-center rounded-3xl border border-red-100 bg-red-50 p-5">
        <Ionicons name="alert-circle-outline" size={28} color="#DC2626" />
        <Text className="mt-2 text-center text-sm text-red-600">
          Workout terakhir gagal dimuat.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Muat ulang workout terakhir"
          onPress={onRetry}
          className="mt-3 rounded-xl bg-red-600 px-4 py-2.5"
        >
          <Text className="text-xs font-bold text-white">Coba Lagi</Text>
        </Pressable>
      </View>
    );
  }

  if (!workout) {
    return (
      <View className="items-center rounded-3xl border border-dashed border-purple-200 bg-purple-50/60 px-6 py-9">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-purple-100">
          <MaterialCommunityIcons name="dumbbell" size={27} color="#6F3FA0" />
        </View>
        <Text className="mt-3 text-base font-bold text-slate-800">
          Belum ada workout
        </Text>
        <Text className="mt-1.5 text-center text-sm leading-5 text-slate-500">
          Workout terakhir belum tersedia untuk ditampilkan.
        </Text>
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm">
      <View className="flex-row items-center justify-between bg-purple-50 px-5 py-4">
        <View className="flex-row items-center">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-purple-600">
            <MaterialCommunityIcons name="dumbbell" size={20} color="#FFFFFF" />
          </View>
          <View className="ml-3">
            <Text className="text-xs font-semibold uppercase tracking-wide text-purple-600">
              Aktivitas Terakhir
            </Text>
            <Text className="mt-0.5 text-base font-bold text-slate-900">
              Workout terakhir
            </Text>
          </View>
        </View>
        <View className="flex-row items-center rounded-full bg-emerald-100 px-3 py-1.5">
          <Ionicons name="checkmark-circle" size={15} color="#15803D" />
          <Text className="ml-1 text-[10px] font-bold uppercase text-emerald-700">
            Selesai
          </Text>
        </View>
      </View>

      <View className="p-5">
        <View className="flex-row">
          <View className="mr-3 flex-1 rounded-2xl bg-slate-50 p-3.5">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={18} color="#6F3FA0" />
              <Text className="ml-2 text-[10px] font-semibold uppercase text-slate-400">
                Tanggal
              </Text>
            </View>
            <Text className="mt-2 text-sm font-bold text-slate-800">
              {formatWorkoutDate(workout.workout_date)}
            </Text>
          </View>

          <View className="flex-1 rounded-2xl bg-slate-50 p-3.5">
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={18} color="#6F3FA0" />
              <Text className="ml-2 text-[10px] font-semibold uppercase text-slate-400">
                Waktu
              </Text>
            </View>
            <Text className="mt-2 text-sm font-bold text-slate-800">
              {formatWorkoutTime(workout.created_at)}
            </Text>
          </View>
        </View>

        <View className="mt-3 flex-row items-center rounded-2xl border border-slate-100 px-4 py-3.5">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-purple-50">
            <Ionicons name="location-outline" size={19} color="#6F3FA0" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-[10px] font-semibold uppercase text-slate-400">
              Lokasi Club
            </Text>
            <Text className="mt-0.5 text-sm font-semibold text-slate-700">
              {workout.club?.club_name || "Informasi club tidak tersedia"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
