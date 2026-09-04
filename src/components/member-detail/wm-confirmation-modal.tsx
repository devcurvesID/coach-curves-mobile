import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface WMConfirmationModalProps {
  visible: boolean;
  appointmentDate: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function WMConfirmationModal({
  visible,
  appointmentDate,
  onCancel,
  onConfirm,
}: WMConfirmationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-6 py-12">
        <Pressable
          onPress={onCancel}
          accessible={false}
          className="absolute inset-0"
        />
        <View
          accessibilityViewIsModal
          className="max-h-full w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-zinc-900"
        >
          <ScrollView bounces={false} contentContainerStyle={{ padding: 24 }}>
            <View className="flex-row items-start justify-between">
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950">
                <Ionicons name="calendar-outline" size={30} color="#8B5CF6" />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tutup konfirmasi"
                onPress={onCancel}
                className="h-11 w-11 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800"
              >
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </Pressable>
            </View>
            <Text
              accessibilityRole="header"
              className="mt-5 text-2xl font-bold text-gray-900 dark:text-white"
            >
              Tetap melakukan input WM?
            </Text>
            <Text className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
              Jadwal penimbangan member belum tiba. Anda dapat melanjutkan jika
              penimbangan akan dilakukan lebih awal.
            </Text>
            <View className="mt-5 rounded-2xl bg-violet-50 p-4 dark:bg-violet-950">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Jadwal penimbangan
              </Text>
              <Text className="mt-1 text-lg font-bold text-[#6F3FA0] dark:text-violet-300">
                {appointmentDate}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              className="mt-6 min-h-12 items-center justify-center rounded-2xl bg-[#6F3FA0] px-4 py-4 active:opacity-80"
            >
              <Text className="text-center font-bold text-white">
                Ya, Tetap Input
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              className="mt-3 min-h-12 items-center justify-center rounded-2xl border border-gray-200 px-4 py-4 dark:border-zinc-700"
            >
              <Text className="text-center font-semibold text-gray-600 dark:text-gray-300">
                Batal
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
