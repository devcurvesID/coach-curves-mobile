import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import { useAuth } from "@/context/auth";
import { useWorkoutByUserId } from "@/hooks/useWorkout";
import { PATH_PUBLIC_IMAGE_REWARD } from "@/utils/constants";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
export default function DetailChallengeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const challenge = JSON.parse(params.data as string);
  console.log("detail club", challenge);
  const { user, signOut } = useAuth();
  const {
    mutate: workoutByUserIdFn,
    data: workoutUser,
    isPending: isPendingWorkoutUser,
  } = useWorkoutByUserId();

  React.useEffect(() => {
    async function getWorkout() {
      await workoutByUserIdFn({
        user_id: user._id,
        offset: 0,
        limit: challenge.variable_target,
      });
    }
    getWorkout();
  }, []);
  const current_progress = workoutUser ? workoutUser.response.length : 0;
  const percentage = Math.min(
    (current_progress / challenge.variable_target) * 100,
    100,
  );

  const user_personal = user.user_personal;

  // 🔥 generate bulan (dinamis)

  const imageChallengeURL = (fileName?: string) => {
    if (!fileName) {
      return "https://placehold.co/600x400/png";
    }
    return `${PATH_PUBLIC_IMAGE_REWARD}/${fileName}`;
  };

  const getTargetChallenge = () => {
    if (current_progress > challenge.variable_target) {
      return challenge.variable_target;
    }
    return current_progress;
  };
  if (isPendingWorkoutUser || !workoutUser) {
    return <LoadingView />;
  }
  console.log("workoutUser", workoutUser);

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
          <View>
            <Image
              source={{
                uri: imageChallengeURL(challenge.picture),
              }}
              style={{
                width: "100%",
                height: 180,
              }}
              resizeMode="cover"
            />
            <View className="absolute top-14 right-5 bg-green-500 px-4 py-2 rounded-full">
              <Text className="text-white font-bold">
                {getTargetChallenge() >= challenge.variable_target
                  ? "🏆 COMPLETED"
                  : "ACTIVE"}
              </Text>
            </View>
          </View>

          {/* Content */}
          <View className="bg-white rounded-t-[35px] -mt-8 p-6">
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
                  {Math.round(percentage)}%
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
                {getTargetChallenge()} / {challenge.variable_target} Workout
              </Text>
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

                  <Text className="font-semibold">
                    {challenge.variable_target}
                  </Text>
                </View>

                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-500">Status</Text>

                  <Text className="font-semibold text-green-600">Active</Text>
                </View>
              </View>
            </View>

            {/* Reward */}
            <View className="mt-8">
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
            </View>

            {/* Recent Progress */}
            <View className="mt-8">
              <Text className="text-xl font-bold mb-4">Recent Progress</Text>

              {!isPendingWorkoutUser &&
                workoutUser.response &&
                workoutUser.response.map((item: any, index: number) => (
                  <View
                    key={item._id}
                    className="flex-row items-center bg-gray-50 rounded-2xl p-4 mb-3"
                  >
                    <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center">
                      <MaterialCommunityIcons
                        name="dumbbell"
                        size={20}
                        color="#6F3FA0"
                      />
                    </View>

                    <View className="ml-3">
                      <Text className="font-semibold">
                        Workout #{index + 1} Completed
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {dayjs(item.workout_date).format("DD MMM YYYY")}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {item.club.club_name}
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
            {/* Button */}

            {getTargetChallenge() != challenge.variable_target ? (
              <TouchableOpacity className="bg-purple-600 py-4 rounded-2xl mt-8 mb-8">
                <Text className="text-center text-white font-bold text-lg">
                  Continue Challenge
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      </ContainerPage>
    </>
  );
}
