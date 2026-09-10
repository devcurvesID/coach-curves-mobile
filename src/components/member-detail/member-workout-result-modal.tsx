import RankOneCard, {
  type RankOneCardData,
} from "@/components/workout/rank-one-card";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import type { MeasurementValue, WeighMeasureProgress } from "./types";

interface MemberWorkoutResultModalProps {
  visible: boolean;
  progress?: WeighMeasureProgress | null;
  member: { name: string; photo?: string | null };
  clubName?: string | null;
  onClose: () => void;
  onPressDetail: () => void;
}

const getDifference = (
  current: MeasurementValue | undefined,
  previous: MeasurementValue | undefined,
): number => {
  const currentValue = Number(current);
  const previousValue = Number(previous);

  if (Number.isNaN(currentValue) || Number.isNaN(previousValue)) return 0;
  return currentValue - previousValue;
};

export function MemberWorkoutResultModal({
  visible,
  progress,
  member,
  clubName,
  onClose,
  onPressDetail,
}: MemberWorkoutResultModalProps) {
  const current = progress?.current;
  const previous = progress?.previous;
  const rankCardData: RankOneCardData | null = current
    ? {
        club: { club_name: clubName?.trim() || "Club belum tersedia" },
        weigh_diff:
          current.weigh_diff ??
          getDifference(current.weight, previous?.weight),
        size_diff:
          current.size_diff ??
          getDifference(
            current.total_measurement,
            previous?.total_measurement,
          ),
        body_fat_diff:
          current.body_fat_diff ??
          getDifference(current.body_fat, previous?.body_fat),
        wo_count: current.wo_count ?? 0,
      }
    : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tutup informasi hasil latihan"
          className="absolute inset-0"
          onPress={onClose}
        />

        <View className="mt-auto max-h-[92%] rounded-t-[32px] bg-[#F8F7FC] pb-6">
          <View className="flex-row items-center justify-between px-6 pb-2 pt-5">
            <View className="mr-4 flex-1">
              <Text className="text-xl font-bold text-gray-900">
                Hasil Latihan
              </Text>
              <Text className="mt-1 text-xs text-gray-500">
                Resume hasil penimbangan {member.name}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tutup modal"
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-white"
            >
              <Ionicons name="close" size={21} color="#6F3FA0" />
            </Pressable>
          </View>

          {rankCardData ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              <RankOneCard
                data={rankCardData}
                member={member}
                detailLabel="Lihat Hasil Penimbangan"
                onPressDetail={onPressDetail}
              />
            </ScrollView>
          ) : (
            <View className="items-center px-8 py-16">
              <View className="rounded-full bg-violet-100 p-5">
                <Ionicons name="scale-outline" size={38} color="#6F3FA0" />
              </View>
              <Text className="mt-4 text-center text-lg font-bold text-gray-900">
                Hasil latihan belum tersedia
              </Text>
              <Text className="mt-2 text-center text-sm leading-5 text-gray-500">
                Resume dapat dilihat setelah member memiliki hasil penimbangan.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
