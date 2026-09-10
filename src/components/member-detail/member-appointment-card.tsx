import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import type { MemberAppointment } from "./types";
import { WMConfirmationModal } from "./wm-confirmation-modal";
export function MemberAppointmentCard({
  appointment,
  isLoadingAppointment,
  canInputWM,
  onPress,
}: {
  appointment?: MemberAppointment;
  isLoadingAppointment: boolean;
  canInputWM: boolean;
  onPress: () => void;
}) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const appointmentDate = appointment ? dayjs(appointment.app_date) : null;
  const hasValidDate = Boolean(appointmentDate?.isValid());

  const handlePress = () => {
    if (!appointmentDate?.isValid()) return;
    if (canInputWM) {
      onPress();
      return;
    }

    setShowConfirmation(true);
  };

  return (
    <>
      {isLoadingAppointment ? (
        <View className="mt-5 flex-row items-center justify-center rounded-3xl border border-gray-100 bg-white p-5  ">
          <Ionicons name="sync-outline" size={20} color="#6F3FA0" />
          <Text className="ml-2 text-sm text-gray-500 ">
            Memuat jadwal WM...
          </Text>
        </View>
      ) : appointment ? (
        <TouchableOpacity
          disabled={!hasValidDate}
          accessibilityRole="button"
          accessibilityLabel="Input hasil penimbangan member"
          accessibilityState={{ disabled: !hasValidDate }}
          accessibilityHint={
            canInputWM
              ? "Buka formulir input WM"
              : "Tampilkan konfirmasi input sebelum jadwal WM"
          }
          activeOpacity={0.8}
          onPress={handlePress}
          className={`mt-5 overflow-hidden rounded-3xl border ${
            canInputWM
              ? "border-violet-200 bg-violet-50  "
              : "border-gray-200 bg-gray-50  "
          }`}
        >
          <View className="flex-row items-center p-5">
            <View
              className={`h-12 w-12 items-center justify-center rounded-2xl ${
                canInputWM
                  ? "bg-white "
                  : "bg-gray-200 "
              }`}
            >
              <Ionicons
                name="scale-outline"
                size={24}
                color={canInputWM ? "#6F3FA0" : "#9CA3AF"}
              />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-500 ">
                Jadwal WM Selanjutnya
              </Text>
              <Text className="mt-1 font-bold text-gray-900 ">
                {appointmentDate?.isValid()
                  ? appointmentDate.format("DD MMM YYYY")
                  : "Tanggal tidak tersedia"}
                {appointment.app_hour
                  ? ` • ${appointment.app_hour.slice(0, 5)} WIB`
                  : ""}
              </Text>
              <Text
                className={`mt-1 text-xs font-semibold ${
                  canInputWM
                    ? "text-[#6F3FA0] "
                    : "text-red-500"
                }`}
              >
                {!hasValidDate
                  ? "Jadwal penimbangan belum tersedia"
                  : canInputWM
                    ? "Ketuk untuk mengisi hasil WM"
                    : "Belum waktunya • Ketuk untuk tetap input WM"}
              </Text>
            </View>
            {hasValidDate && (
              <Ionicons name="arrow-forward-circle" size={28} color="#6F3FA0" />
            )}
          </View>
        </TouchableOpacity>
      ) : null}
      <WMConfirmationModal
        visible={showConfirmation && hasValidDate && !isLoadingAppointment}
        appointmentDate={appointmentDate?.format("DD MMM YYYY") ?? ""}
        onCancel={() => setShowConfirmation(false)}
        onConfirm={() => {
          setShowConfirmation(false);
          if (hasValidDate && !isLoadingAppointment) onPress();
        }}
      />
    </>
  );
}
