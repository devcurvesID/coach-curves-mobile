import type { MemberAppointment } from "@/components/member-detail/types";
import { useAuth } from "@/context/auth";
import { formatDate } from "@/helpers/dates";
import { useMemberAppointmentByUserId } from "@/hooks/useWeighMeasure";
import { useWorkoutHistory } from "@/hooks/useWorkout";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Circle, Svg } from "react-native-svg";

const MONTHLY_WORKOUT_TARGET = 12;

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const Card = ({ children, style }: CardProps) => (
  <View
    style={[
      {
        padding: 20,
        borderWidth: 1,
        borderColor: "#FBCFE8",
        borderRadius: 28,
        backgroundColor: "#FFF0F6",
        shadowColor: "#E91E63",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
      },
      style,
    ]}
  >
    {children}
  </View>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Text className="text-center text-sm font-extrabold tracking-wide text-pink-600">
    {children}
  </Text>
);

const Divider = () => (
  <View className="my-3.5 border-t border-dashed border-pink-200" />
);

const RingProgress = ({ percentage }: { percentage: number }) => {
  const size = 110;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePercentage = Math.min(Math.max(percentage, 0), 100);
  const progressOffset = circumference * (1 - safePercentage / 100);

  return (
    <View className="h-[110px] w-[110px] items-center justify-center">
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FBCFE8"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E91E63"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text className="text-xl font-extrabold text-pink-600">
        {Math.round(safePercentage)}%
      </Text>
    </View>
  );
};

const getNearestAppointment = (
  data: MemberAppointment | MemberAppointment[] | null | undefined,
): MemberAppointment | null => {
  const appointments = (Array.isArray(data) ? data : data ? [data] : [])
    .filter((appointment) => dayjs(appointment.app_date).isValid())
    .sort(
      (first, second) =>
        dayjs(first.app_date).valueOf() - dayjs(second.app_date).valueOf(),
    );
  const today = dayjs().startOf("day");

  return (
    appointments.find(
      (appointment) => !dayjs(appointment.app_date).isBefore(today, "day"),
    ) ??
    appointments.at(-1) ??
    null
  );
};

const AppointmentCard = ({
  appointment,
  isLoading,
  isError,
}: {
  appointment: MemberAppointment | null;
  isLoading: boolean;
  isError: boolean;
}) => (
  <Card>
    <View className="flex-row items-center">
      <Ionicons name="calendar" size={16} color="#E91E63" />
      <Text className="ml-1.5 text-sm font-extrabold text-pink-600">
        Jadwal
      </Text>
    </View>
    <Text className="mt-0.5 text-xs font-semibold text-purple-700">
      Penimbangan & Pengukuran
    </Text>
    <Divider />

    <View className="flex-row items-center rounded-2xl bg-pink-100 p-3">
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color="#E91E63" />
          <Text className="ml-2 flex-1 text-xs font-semibold text-pink-600">
            Memuat jadwal...
          </Text>
        </>
      ) : isError ? (
        <>
          <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
          <Text className="ml-2 flex-1 text-xs font-semibold text-red-600">
            Jadwal gagal dimuat
          </Text>
        </>
      ) : (
        <>
          <Ionicons name="scale-outline" size={18} color="#EC4899" />
          <View className="ml-2 flex-1">
            <Text className="text-xs font-bold text-pink-600">
              {appointment
                ? formatDate(appointment.app_date)
                : "Belum dijadwalkan"}
            </Text>
            {/* {appointment?.app_hour ? (
              <Text className="mt-1 text-[11px] text-pink-500">
                Pukul {appointment.app_hour}
              </Text>
            ) : null} */}
          </View>
        </>
      )}
    </View>
  </Card>
);

export const InformationWorkOutView = () => {
  const { user } = useAuth();
  const {
    mutate: loadWorkoutHistory,
    data: workoutHistory,
    isPending: isLoadingWorkout,
  } = useWorkoutHistory();
  const {
    data: appointmentData,
    isLoading: isLoadingAppointment,
    isError: isAppointmentError,
  } = useMemberAppointmentByUserId(user?._id);

  useEffect(() => {
    const today = new Date();
    loadWorkoutHistory({
      year: today.getFullYear(),
      month: today.getMonth(),
    });
  }, [loadWorkoutHistory]);

  const appointment = useMemo(
    () => getNearestAppointment(appointmentData),
    [appointmentData],
  );
  const monthlyWorkoutTotal = workoutHistory?.total_workout_per_month ?? 0;
  const allWorkoutTotal = workoutHistory?.total ?? 0;
  const remainingWorkout = Math.max(
    MONTHLY_WORKOUT_TARGET - monthlyWorkoutTotal,
    0,
  );
  const workoutPercentage =
    (monthlyWorkoutTotal / MONTHLY_WORKOUT_TARGET) * 100;

  if (isLoadingWorkout && !workoutHistory) {
    return (
      <View className="mt-5 items-center rounded-3xl bg-white px-6 py-10">
        <ActivityIndicator color="#6F3FA0" />
        <Text className="mt-3 text-sm text-slate-500">
          Memuat informasi workout...
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-5 flex-row gap-3">
      <View className="flex-1 gap-3">
        <Card>
          <SectionTitle>Latihan Total</SectionTitle>
          <SectionTitle>Sejak Menjadi Anggota</SectionTitle>
          <Divider />

          <View className="mb-3 items-center rounded-[20px] bg-white p-3.5 shadow-sm">
            <Text className="text-5xl font-black leading-[54px] text-[#6F3FA0]">
              {allWorkoutTotal}
              <Text className="text-xl text-pink-600">x</Text>
            </Text>
            <Text className="mt-0.5 text-center text-[11px] text-slate-400">
              latihan sejak jadi anggota
            </Text>
          </View>

          <View className="rounded-2xl bg-pink-100 p-3">
            <View className="flex-row items-center">
              <Ionicons name="flag" size={14} color="#E91E63" />
              <Text className="ml-1.5 text-xs font-bold text-pink-600">
                Target
              </Text>
            </View>
            <Text className="mt-1 text-xl font-black text-pink-600">
              {remainingWorkout}x
            </Text>
            <Text className="mt-0.5 text-[11px] text-slate-500">
              lagi untuk mencapai {MONTHLY_WORKOUT_TARGET} workout
            </Text>
          </View>
        </Card>
      </View>

      <View className="flex-1 gap-3">
        <Card>
          <SectionTitle>Total Latihan Bulan Ini</SectionTitle>
          <Divider />
          <View className="items-center">
            <RingProgress percentage={workoutPercentage} />
            <View className="mt-3.5 items-center rounded-2xl bg-pink-100 px-3.5 py-2">
              <Text className="text-2xl font-black text-pink-500">Ayo! 🔥</Text>
              <Text className="mt-0.5 text-center text-xs font-bold text-pink-600">
                capai {MONTHLY_WORKOUT_TARGET}x bulan ini!
              </Text>
            </View>
            <Text className="mt-2.5 text-center text-[11px] text-slate-400">
              {remainingWorkout > 0
                ? `hanya perlu ${remainingWorkout} kali lagi!`
                : "target bulan ini tercapai!"}
            </Text>
          </View>
        </Card>

        <AppointmentCard
          appointment={appointment}
          isLoading={isLoadingAppointment}
          isError={isAppointmentError}
        />
      </View>
    </View>
  );
};
