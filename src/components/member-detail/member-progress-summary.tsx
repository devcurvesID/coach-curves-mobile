import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDate } from "@/helpers/dates";
import { ProgressMetric } from "./information-components";
import type { WeighMeasureProgress } from "./types";
export function MemberProgressSummary({
  progress,
  isPendingWeighMeasureProgress,
  isWeighMeasureProgressError,
  onPress,
}: {
  progress?: WeighMeasureProgress | null;
  isPendingWeighMeasureProgress: boolean;
  isWeighMeasureProgressError: boolean;
  onPress: () => void;
}) {
  const currentMeasurement = progress?.current;
  const previousMeasurement = progress?.previous;
  const hasWeighMeasureProgress = Boolean(
    currentMeasurement && previousMeasurement,
  );
  return (
    <>
      {isPendingWeighMeasureProgress ? (
        <View className="mt-5 flex-row items-center justify-center rounded-3xl border border-gray-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <Ionicons name="analytics-outline" size={20} color="#6F3FA0" />
          <Text className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            Memuat progres hasil latihan...
          </Text>
        </View>
      ) : isWeighMeasureProgressError ? (
        <View className="mt-5 flex-row items-center rounded-3xl border border-red-100 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950">
          <Ionicons name="alert-circle-outline" size={22} color="#DC2626" />
          <View className="ml-3 flex-1">
            <Text className="font-bold text-red-700 dark:text-red-300">
              Progres latihan gagal dimuat
            </Text>
            <Text className="mt-1 text-xs text-red-600 dark:text-red-400">
              Silakan muat ulang halaman untuk mencoba kembali.
            </Text>
          </View>
        </View>
      ) : hasWeighMeasureProgress ? (
        <View className="mt-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <View className="flex-row items-start justify-between">
            <View className="mr-3 flex-1">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                Progres Hasil Latihan
              </Text>
              <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Perbandingan dua penimbangan terakhir
              </Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-950">
              <Ionicons name="analytics-outline" size={22} color="#6F3FA0" />
            </View>
          </View>

          <View className="mt-4 flex-row items-center rounded-xl bg-violet-50 px-3 py-2.5 dark:bg-violet-950">
            <Ionicons name="calendar-outline" size={17} color="#6F3FA0" />
            <Text className="ml-2 text-xs font-semibold text-[#6F3FA0] dark:text-violet-300">
              {formatDate(previousMeasurement!.wm_date)} →{" "}
              {formatDate(currentMeasurement!.wm_date)}
            </Text>
          </View>

          <View className="mt-4 flex-row flex-wrap justify-between">
            <ProgressMetric
              label="Berat Tubuh"
              previous={previousMeasurement!.weight}
              current={currentMeasurement!.weight}
              unit=" kg"
              favorable="decrease"
            />
            <ProgressMetric
              label="Body Fat"
              previous={previousMeasurement!.body_fat}
              current={currentMeasurement!.body_fat}
              unit="%"
              favorable="decrease"
            />
            <ProgressMetric
              label="BMI"
              previous={previousMeasurement!.bmi}
              current={currentMeasurement!.bmi}
            />
            <ProgressMetric
              label="Total Ukuran"
              previous={previousMeasurement!.total_measurement}
              current={currentMeasurement!.total_measurement}
              unit=" cm"
              favorable="decrease"
            />
          </View>

          <TouchableOpacity
            onPress={onPress}
            className="mt-1 flex-row items-center justify-center rounded-2xl bg-violet-50 py-3.5 dark:bg-violet-950"
          >
            <Text className="font-bold text-[#6F3FA0] dark:text-violet-300">
              Lihat Progres Lengkap
            </Text>
            <Ionicons name="arrow-forward" size={17} color="#6F3FA0" />
          </TouchableOpacity>
        </View>
      ) : null}
    </>
  );
}
