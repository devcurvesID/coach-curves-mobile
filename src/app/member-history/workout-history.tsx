import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import { useDetailMemberByUserId } from "@/hooks/useMember";
import { useWorkoutHistoryByUserId } from "@/hooks/useWorkout";
import { imageProfileURL } from "@/services/image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

interface WorkoutClub {
  club_name?: string | null;
}

interface WorkoutRecord {
  _id: string;
  workout_date: string;
  club?: WorkoutClub | null;
}

interface MemberDetail {
  user_id: string;
  user: {
    name: string;
    email?: string | null;
  };
  photo?: string | null;
  flag?: string | null;
  key_tag_id?: string | null;
  joined?: string | null;
}

type HistoryFilter = "current-month" | "all";

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const isValidDate = (value: string): boolean =>
  !Number.isNaN(new Date(value).getTime());

const isCurrentMonth = (value: string): boolean => {
  const date = new Date(value);
  const today = new Date();
  return (
    isValidDate(value) &&
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth()
  );
};

const isWithinLastSevenDays = (value: string): boolean => {
  if (!isValidDate(value)) return false;
  const difference = Date.now() - new Date(value).getTime();
  return difference >= 0 && difference <= 7 * 24 * 60 * 60 * 1000;
};

const formatWorkoutDate = (value: string): string => {
  if (!isValidDate(value)) return "Tanggal tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

const formatWorkoutTime = (value: string): string => {
  if (!isValidDate(value)) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
};

function StatCard({
  icon,
  label,
  value,
  color,
  backgroundColor,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: number;
  color: string;
  backgroundColor: string;
}) {
  return (
    <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor }}
      >
        <Ionicons name={icon} size={21} color={color} />
      </View>
      <Text className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </Text>
      <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {label}
      </Text>
    </View>
  );
}

function WorkoutHistoryCard({
  workout,
  sequence,
}: {
  workout: WorkoutRecord;
  sequence: number;
}) {
  return (
    <View className="mx-5 mb-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <View className="flex-row items-start">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-950">
          <MaterialCommunityIcons name="dumbbell" size={27} color="#6F3FA0" />
        </View>

        <View className="ml-4 flex-1">
          <View className="flex-row items-start justify-between">
            <View className="mr-2 flex-1">
              <Text className="font-bold text-gray-900 dark:text-white">
                Sesi Workout
              </Text>
              <Text
                numberOfLines={1}
                className="mt-1 text-sm text-gray-500 dark:text-gray-400"
              >
                {workout.club?.club_name || "Club tidak tersedia"}
              </Text>
            </View>
            <View className="rounded-full bg-violet-50 px-2.5 py-1 dark:bg-violet-950">
              <Text className="text-[10px] font-bold text-[#6F3FA0] dark:text-violet-300">
                #{sequence}
              </Text>
            </View>
          </View>

          <View className="mt-4 gap-2.5 border-t border-gray-100 pt-3 dark:border-zinc-800">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={17} color="#6F3FA0" />
              <Text className="ml-2 flex-1 text-sm text-gray-700 dark:text-gray-300">
                {formatWorkoutDate(workout.workout_date)}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={17} color="#6F3FA0" />
              <Text className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {formatWorkoutTime(workout.workout_date)} WIB
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function WorkoutHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [filter, setFilter] = useState<HistoryFilter>("current-month");

  const {
    mutate: loadMemberDetail,
    data: memberData,
    isPending: isLoadingMember,
    isError: isMemberError,
  } = useDetailMemberByUserId();
  const {
    mutate: loadWorkoutHistory,
    data: historyData,
    isPending: isLoadingHistory,
    isError: isHistoryError,
  } = useWorkoutHistoryByUserId();

  useEffect(() => {
    if (!id) return;
    loadMemberDetail(id);
    loadWorkoutHistory(id);
  }, [id, loadMemberDetail, loadWorkoutHistory]);

  const member = memberData as MemberDetail | undefined;
  const workouts = useMemo(() => {
    const records = (historyData ?? []) as WorkoutRecord[];
    return [...records].sort(
      (first, second) =>
        new Date(second.workout_date).getTime() -
        new Date(first.workout_date).getTime(),
    );
  }, [historyData]);

  const currentMonthTotal = workouts.filter((workout) =>
    isCurrentMonth(workout.workout_date),
  ).length;
  const lastSevenDaysTotal = workouts.filter((workout) =>
    isWithinLastSevenDays(workout.workout_date),
  ).length;
  const visibleWorkouts =
    filter === "current-month"
      ? workouts.filter((workout) => isCurrentMonth(workout.workout_date))
      : workouts;

  const refresh = () => {
    if (!id) return;
    loadMemberDetail(id);
    loadWorkoutHistory(id);
  };

  if ((isLoadingMember || isLoadingHistory) && !memberData && !historyData) {
    return <LoadingView />;
  }

  const hasError = isMemberError || isHistoryError;

  return (
    <ContainerPage
      titleHeader="Riwayat Workout"
      titleContent={member?.user.name ?? "Member"}
    >
      <FlatList
        data={visibleWorkouts}
        keyExtractor={(workout, index) => workout._id || String(index)}
        renderItem={({ item, index }) => (
          <WorkoutHistoryCard
            workout={item}
            sequence={visibleWorkouts.length - index}
          />
        )}
        refreshing={isLoadingMember || isLoadingHistory}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
        ListHeaderComponent={
          <View>
            <View className="mx-5 mt-5 rounded-3xl bg-[#6F3FA0] p-5 shadow-sm">
              <View className="flex-row items-center">
                {member?.photo ? (
                  <Image
                    source={{ uri: imageProfileURL(member.photo) }}
                    className="h-16 w-16 rounded-2xl border-2 border-white/30 bg-violet-100"
                  />
                ) : (
                  <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white">
                    <Text className="text-xl font-bold text-[#6F3FA0]">
                      {getInitials(member?.user.name ?? "")}
                    </Text>
                  </View>
                )}

                <View className="ml-4 flex-1">
                  <Text
                    numberOfLines={1}
                    className="text-xl font-bold text-white"
                  >
                    {member?.user.name ?? "Member"}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="mt-1 text-sm text-violet-200"
                  >
                    {member?.user.email || "Email belum tersedia"}
                  </Text>
                  <View className="mt-2 self-start rounded-full bg-white/15 px-2.5 py-1">
                    <Text className="text-xs font-semibold text-white">
                      Key Tag: {member?.key_tag_id || "-"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="mx-5 mt-4 flex-row gap-3">
              <StatCard
                icon="barbell-outline"
                label="Total Workout"
                value={workouts.length}
                color="#6F3FA0"
                backgroundColor="#F3E8FF"
              />
              <StatCard
                icon="calendar-outline"
                label="Bulan Ini"
                value={currentMonthTotal}
                color="#0EA5E9"
                backgroundColor="#E0F2FE"
              />
              <StatCard
                icon="pulse-outline"
                label="7 Hari"
                value={lastSevenDaysTotal}
                color="#10B981"
                backgroundColor="#D1FAE5"
              />
            </View>

            <View className="mx-5 mb-4 mt-6">
              <View className="flex-row items-end justify-between">
                <View>
                  <Text className="text-xl font-bold text-gray-900 dark:text-white">
                    Daftar Workout
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {visibleWorkouts.length} sesi ditampilkan
                  </Text>
                </View>
                <View className="flex-row rounded-xl bg-gray-100 p-1 dark:bg-zinc-800">
                  <TouchableOpacity
                    onPress={() => setFilter("current-month")}
                    className={`rounded-lg px-3 py-2 ${
                      filter === "current-month"
                        ? "bg-white dark:bg-zinc-700"
                        : ""
                    }`}
                  >
                    <Text className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      Bulan Ini
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFilter("all")}
                    className={`rounded-lg px-3 py-2 ${
                      filter === "all" ? "bg-white dark:bg-zinc-700" : ""
                    }`}
                  >
                    <Text className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      Semua
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8 pb-20">
            <View
              className={`mb-4 rounded-full p-5 ${
                hasError ? "bg-red-50" : "bg-violet-50 dark:bg-violet-950"
              }`}
            >
              <Ionicons
                name={hasError ? "alert-circle-outline" : "barbell-outline"}
                size={40}
                color={hasError ? "#DC2626" : "#6F3FA0"}
              />
            </View>
            <Text className="text-center text-lg font-bold text-gray-800 dark:text-white">
              {hasError
                ? "Riwayat workout gagal dimuat"
                : filter === "current-month"
                  ? "Belum ada workout bulan ini"
                  : "Belum ada riwayat workout"}
            </Text>
            <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              {hasError
                ? "Tarik layar ke bawah untuk mencoba kembali."
                : "Sesi workout yang telah dilakukan akan muncul di sini."}
            </Text>
          </View>
        }
      />
    </ContainerPage>
  );
}
