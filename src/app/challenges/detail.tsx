import ContainerPage from "@/components/ui/container-page";
import { FullscreenImage } from "@/components/ui/fullscreen-image";
import { LoadingView } from "@/components/ui/loading";
import { WorkoutHistoryTimeline } from "@/components/workout/workout-history-timeline";
import { useAuth } from "@/context/auth";
import { useWorkoutByUserId } from "@/hooks/useWorkout";
import { rewardImageURL } from "@/services/image";
import { memberService } from "@/services/memberService";
import type { WorkoutRecord } from "@/types/workout";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const WORKOUT_PAGE_SIZE = 10;

export default function DetailChallengeScreen() {
  const params = useLocalSearchParams();
  const challenge = JSON.parse(params.data as string);
  const { user } = useAuth();
  const { mutateAsync: loadWorkoutPage } = useWorkoutByUserId();
  const [workouts, setWorkouts] = React.useState<WorkoutRecord[]>([]);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [totalWorkout, setTotalWorkout] = React.useState<number | null>(null);
  const [isProgressLoading, setIsProgressLoading] = React.useState(true);
  const [progressError, setProgressError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);
  const target = Math.max(
    Math.floor(Number(challenge.variable_target) || 0),
    0,
  );

  React.useEffect(() => {
    let isActive = true;

    const getChallengeInformation = async () => {
      try {
        setIsProgressLoading(true);
        setProgressError(null);
        const information = await memberService.getInformationChallengesUser(
          user._id,
        );
        if (!isActive) return;

        setTotalWorkout(
          Math.max(Math.floor(Number(information?.total_workout) || 0), 0),
        );
      } catch (error) {
        if (!isActive) return;
        setProgressError(
          error instanceof Error
            ? error.message
            : "Progress challenge gagal dimuat.",
        );
      } finally {
        if (isActive) setIsProgressLoading(false);
      }
    };

    void getChallengeInformation();
    return () => {
      isActive = false;
    };
  }, [reloadKey, user._id]);

  React.useEffect(() => {
    let isActive = true;

    const getWorkoutInPages = async () => {
      setWorkouts([]);
      setLoadError(null);
      setIsInitialLoading(true);

      let loadedWorkouts: WorkoutRecord[] = [];

      try {
        while (isActive && loadedWorkouts.length < target) {
          const remaining = target - loadedWorkouts.length;
          const limit = Math.min(WORKOUT_PAGE_SIZE, remaining);

          if (loadedWorkouts.length > 0) setIsLoadingMore(true);

          const page = await loadWorkoutPage({
            user_id: user._id,
            offset: loadedWorkouts.length,
            limit,
          });
          if (!isActive) return;

          const existingIds = new Set(
            loadedWorkouts.map((workout) => workout._id),
          );
          const newWorkouts = page.response.filter(
            (workout) => !existingIds.has(workout._id),
          );

          loadedWorkouts = [...loadedWorkouts, ...newWorkouts].slice(0, target);
          setWorkouts(loadedWorkouts);
          setIsInitialLoading(false);

          // A short page means the API has no more records. No new IDs also
          // prevents an endless loop if an API ignores the offset parameter.
          if (page.response.length < limit || newWorkouts.length === 0) break;
        }
      } catch (error) {
        if (!isActive) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Riwayat workout gagal dimuat.",
        );
      } finally {
        if (isActive) {
          setIsInitialLoading(false);
          setIsLoadingMore(false);
        }
      }
    };

    if (target === 0) {
      setIsInitialLoading(false);
      return () => {
        isActive = false;
      };
    }

    void getWorkoutInPages();
    return () => {
      isActive = false;
    };
  }, [loadWorkoutPage, reloadKey, target, user._id]);

  const current_progress = totalWorkout ?? 0;
  const percentage = Math.min(
    target > 0 ? (current_progress / target) * 100 : 0,
    100,
  );

  const getTargetChallenge = () => {
    if (current_progress > target) {
      return target;
    }
    return current_progress;
  };
  if (isInitialLoading) {
    return <LoadingView />;
  }
  return (
    <>
      <ContainerPage
        titleHeader={challenge.challenge}
        titleContent="Detail Challenge"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName=" pt-5 pb-32"
          showsVerticalScrollIndicator={false}
        >
          {/* FULL WIDTH IMAGE */}
          {/* <View
            className="bg-white rounded-3xl mb-5 overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Image
              source={{
                uri: rewardImageURL(challenge.picture),
              }}
              style={{
                width: "100%",
                aspectRatio: 1440 / 200,
              }}
              resizeMode="cover"
            />

            <View className="absolute top-12 right-5 bg-green-500 px-4 py-2 rounded-full">
              <Text className="text-white font-bold">
                {getTargetChallenge() >= target
                  ? "🏆 COMPLETED"
                  : "ACTIVE"}
              </Text>
            </View>
          </View> */}

          <FullscreenImage
            imageUrl={rewardImageURL(challenge.picture)}
            accessibilityLabel="Buka gambar challenge dalam layar penuh"
            status={getTargetChallenge() >= target ? "🏆 COMPLETED" : "ACTIVE"}
          />

          {/* Content */}
          <View className="bg-white rounded-t-[35px] mt-8 p-6">
            {/* Title */}
            <Text className="text-3xl font-bold text-gray-800">
              {challenge.challenge}
            </Text>

            <Text className="text-gray-500 mt-1 capitalize">
              {challenge.type} Challenge
            </Text>

            {/* Progress */}
            <View className="mt-8">
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Progress</Text>

                <Text className="font-bold text-purple-600">
                  {isProgressLoading
                    ? "Memuat..."
                    : `${Math.round(percentage)}%`}
                </Text>
              </View>

              <View className="h-4 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <View
                  className="h-full bg-purple-600 rounded-full"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </View>

              <Text className="mt-3 text-lg font-semibold text-gray-800">
                {isProgressLoading ? "-" : getTargetChallenge()} / {target}{" "}
                Workout
              </Text>

              {progressError && (
                <View className="mt-3 flex-row items-center justify-between rounded-xl bg-red-50 px-3 py-2.5">
                  <Text className="mr-3 flex-1 text-sm text-red-700">
                    Progress gagal dimuat.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setReloadKey((value) => value + 1)}
                  >
                    <Text className="font-semibold text-red-700">
                      Coba Lagi
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Info */}
            <View className="mt-8">
              <Text className="text-xl font-bold mb-4">
                Challenge Information
              </Text>

              <View className="bg-gray-50 rounded-3xl p-5">
                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-500">Type</Text>

                  <Text className="font-semibold">Workout</Text>
                </View>

                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-500">Sequence</Text>

                  <Text className="font-semibold">#{challenge.sequence}</Text>
                </View>

                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-500">Target</Text>

                  <Text className="font-semibold">{target}</Text>
                </View>

                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-500">Status</Text>

                  <Text className="font-semibold text-green-600">Active</Text>
                </View>
              </View>
            </View>

            {/* Reward */}
            {/* <View className="mt-8">
              <Text className="text-xl font-bold mb-4">Rewards</Text>

              <View className="bg-purple-50 rounded-3xl p-5">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="trophy-award"
                    size={28}
                    color="#6F3FA0"
                  />

                  <Text className="ml-3 font-semibold">
                    Exclusive Challenge Badge
                  </Text>
                </View>

                <View className="flex-row items-center mt-4">
                  <Ionicons name="ribbon-outline" size={24} color="#6F3FA0" />

                  <Text className="ml-3 font-semibold">
                    Digital Certificate
                  </Text>
                </View>
              </View>
            </View> */}

            {/* Recent Progress */}
            <View className="mt-8">
              <Text className="mb-1 text-xl font-bold text-slate-900">
                Riwayat Progress
              </Text>
              <Text className="mb-5 text-sm leading-5 text-slate-500">
                Daftar workout yang telah dihitung dalam challenge ini.
              </Text>

              <WorkoutHistoryTimeline
                workouts={workouts}
                target={target}
                summaryLabel="Riwayat dimuat"
                emptyDescription="Selesaikan workout pertama untuk mulai mencatat progress challenge."
              />

              {isLoadingMore && (
                <View className="mt-2 flex-row items-center justify-center rounded-2xl bg-purple-50 px-4 py-3">
                  <ActivityIndicator size="small" color="#6F3FA0" />
                  <Text className="ml-2 text-sm font-medium text-purple-700">
                    Memuat riwayat {workouts.length}/{target}...
                  </Text>
                </View>
              )}

              {loadError && (
                <View className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                  <Text className="text-center text-sm text-red-700">
                    {loadError}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setReloadKey((value) => value + 1)}
                    className="mt-3 items-center rounded-xl bg-red-600 py-3"
                  >
                    <Text className="font-semibold text-white">Coba Lagi</Text>
                  </Pressable>
                </View>
              )}
            </View>
            {/* Button */}

            {/* {getTargetChallenge() != challenge.variable_target ? (
              <TouchableOpacity className="bg-purple-600 py-4 rounded-2xl mt-8 mb-8">
                <Text className="text-center text-white font-bold text-lg">
                  Continue Challenge
                </Text>
              </TouchableOpacity>
            ) : null} */}
          </View>
        </ScrollView>
      </ContainerPage>
    </>
  );
}
