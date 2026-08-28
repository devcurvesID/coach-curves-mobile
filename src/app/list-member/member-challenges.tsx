import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import { useChallenges } from "@/hooks/useChallenges";
import { useWorkoutHistoryByUserId } from "@/hooks/useWorkout";
import { PATH_PUBLIC_IMAGE_REWARD } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

type ChallengeFilter = "incomplete" | "completed";

interface Challenge {
  _id: string;
  challenge: string;
  type?: string | null;
  picture?: string | null;
  variable_target: number;
}

interface WorkoutRecord {
  _id: string;
}

const getChallengeImageUrl = (picture?: string | null): string =>
  picture
    ? `${PATH_PUBLIC_IMAGE_REWARD}/${picture}`
    : "https://placehold.co/600x400/png";

const getChallengeTarget = (challenge: Challenge): number =>
  Math.max(Number(challenge.variable_target) || 0, 1);

function ChallengeCard({
  challenge,
  workoutCount,
}: {
  challenge: Challenge;
  workoutCount: number;
}) {
  const target = getChallengeTarget(challenge);
  const progress = Math.min(workoutCount, target);
  const percentage = Math.min((progress / target) * 100, 100);
  const completed = workoutCount >= target;

  return (
    <View className="mx-5 mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <Image
        source={{ uri: getChallengeImageUrl(challenge.picture) }}
        resizeMode="cover"
        className="h-36 w-full bg-gray-100"
      />
      <View className="p-5">
        <View className="flex-row items-start justify-between">
          <View className="mr-3 flex-1">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              {challenge.challenge}
            </Text>
            <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {challenge.type || "Workout Challenge"}
            </Text>
          </View>
          <View
            className={`rounded-full px-2.5 py-1 ${
              completed
                ? "bg-green-50 dark:bg-green-950"
                : "bg-amber-50 dark:bg-amber-950"
            }`}
          >
            <Text
              className={`text-[10px] font-bold ${
                completed
                  ? "text-green-700 dark:text-green-300"
                  : "text-amber-700 dark:text-amber-300"
              }`}
            >
              {completed ? "SELESAI" : "BERJALAN"}
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row items-center justify-between">
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Progres workout
          </Text>
          <Text className="text-xs font-bold text-[#6F3FA0] dark:text-violet-300">
            {progress}/{target} sesi
          </Text>
        </View>
        <View className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
          <View
            className={
              completed ? "h-full bg-green-500" : "h-full bg-[#6F3FA0]"
            }
            style={{ width: `${percentage}%` }}
          />
        </View>
        <Text className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          {completed
            ? "Target challenge telah tercapai."
            : `${Math.max(target - workoutCount, 0)} workout lagi untuk menyelesaikan challenge.`}
        </Text>
      </View>
    </View>
  );
}

export default function MemberChallengesScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const [filter, setFilter] = useState<ChallengeFilter>("incomplete");
  const {
    data: challengeData,
    isLoading: isLoadingChallenges,
    isError: isChallengeError,
  } = useChallenges(id);
  const {
    mutate: loadWorkoutHistory,
    data: workoutData,
    isPending: isLoadingWorkouts,
    isError: isWorkoutError,
  } = useWorkoutHistoryByUserId();

  useEffect(() => {
    if (!id) return;
    const today = new Date();
    loadWorkoutHistory({
      user_id: id,
      year: today.getFullYear(),
      month: today.getMonth(),
    });
  }, [id, loadWorkoutHistory]);

  const challenges = (challengeData ?? []) as Challenge[];
  const workoutCount = ((workoutData ?? []) as WorkoutRecord[]).length;
  const completedCount = challenges.filter(
    (challenge) => workoutCount >= getChallengeTarget(challenge),
  ).length;
  const visibleChallenges = useMemo(
    () =>
      challenges.filter((challenge) => {
        const completed = workoutCount >= getChallengeTarget(challenge);
        return filter === "completed" ? completed : !completed;
      }),
    [challenges, filter, workoutCount],
  );

  if (
    (isLoadingChallenges && !challengeData) ||
    (isLoadingWorkouts && !workoutData)
  ) {
    return <LoadingView />;
  }

  const hasError = isChallengeError || isWorkoutError;

  return (
    <ContainerPage
      titleHeader="Challenges Member"
      titleContent={name || "Member"}
    >
      <FlatList
        data={visibleChallenges}
        keyExtractor={(challenge) => challenge._id}
        renderItem={({ item }) => (
          <ChallengeCard challenge={item} workoutCount={workoutCount} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
        ListHeaderComponent={
          <View>
            <View className="mx-5 mt-5 rounded-3xl bg-[#6F3FA0] p-5">
              <Text className="text-sm text-violet-200">Progres challenge</Text>
              <Text className="mt-1 text-xl font-bold text-white">
                {name || "Member"}
              </Text>
              <View className="mt-5 flex-row">
                <View className="flex-1 border-r border-white/20">
                  <Text className="text-2xl font-bold text-white">
                    {challenges.length - completedCount}
                  </Text>
                  <Text className="mt-1 text-xs text-violet-200">
                    Belum selesai
                  </Text>
                </View>
                <View className="flex-1 pl-5">
                  <Text className="text-2xl font-bold text-white">
                    {completedCount}
                  </Text>
                  <Text className="mt-1 text-xs text-violet-200">Selesai</Text>
                </View>
              </View>
            </View>

            <View className="mx-5 mb-5 mt-4 flex-row rounded-2xl bg-gray-100 p-1 dark:bg-zinc-800">
              <TouchableOpacity
                onPress={() => setFilter("incomplete")}
                className={`flex-1 items-center rounded-xl py-3 ${
                  filter === "incomplete" ? "bg-white dark:bg-zinc-700" : ""
                }`}
              >
                <Text className="font-semibold text-gray-700 dark:text-gray-200">
                  Belum Selesai
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilter("completed")}
                className={`flex-1 items-center rounded-xl py-3 ${
                  filter === "completed" ? "bg-white dark:bg-zinc-700" : ""
                }`}
              >
                <Text className="font-semibold text-gray-700 dark:text-gray-200">
                  Selesai
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8 pb-20">
            <View
              className={`mb-4 rounded-full p-5 ${
                hasError ? "bg-red-50" : "bg-amber-50 dark:bg-amber-950"
              }`}
            >
              <Ionicons
                name={hasError ? "alert-circle-outline" : "trophy-outline"}
                size={40}
                color={hasError ? "#DC2626" : "#F59E0B"}
              />
            </View>
            <Text className="text-center text-lg font-bold text-gray-800 dark:text-white">
              {hasError
                ? "Challenge gagal dimuat"
                : filter === "completed"
                  ? "Belum ada challenge selesai"
                  : "Semua challenge sudah selesai"}
            </Text>
          </View>
        }
      />
    </ContainerPage>
  );
}
