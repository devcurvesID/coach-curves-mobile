import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import { useAuth } from "@/context/auth";
import { useChallenges } from "@/hooks/useChallenges";
import { useWorkoutHistory } from "@/hooks/useWorkout";
import { PATH_PUBLIC_IMAGE_REWARD } from "@/utils/constants";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChallengesScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: challenges, isLoading: isLoadingChallenges } = useChallenges();
  const [search, setSearch] = useState("");
  const {
    mutate: workoutHistoryFn,
    data: workoutHistory,
    isPending: isPendingWorkout,
  } = useWorkoutHistory();

  React.useEffect(() => {
    async function getWorkout() {
      let joined_year = new Date().getFullYear();
      let joined_month = new Date().getMonth();
      await workoutHistoryFn({ year: joined_year, month: joined_month });
    }
    getWorkout();
  }, []);
  const onDetail = (wm: any) => {
    router.push({
      pathname: "/challenges/detail",
      params: { data: JSON.stringify(wm) }, //{ ...data, bank: { ...data.bank } },
    });
  };
  const filteredData = React.useMemo(() => {
    if (!search) return challenges;

    return challenges.filter((item: any) => {
      const keyword = search.toLowerCase();

      return (
        item.challenge.toLowerCase().includes(keyword) ||
        item.type.toLowerCase().includes(keyword)
      );
    });
  }, [search]);
  // 🔥 generate bulan (dinamis)
  if (isLoadingChallenges) {
    return <LoadingView />;
  }
  return (
    <>
      <ContainerPage titleHeader="Challenges" titleContent="Challenges">
        <View className="bg-purple-600 rounded-3xl p-5 mx-5">
          <Text className="text-white text-lg font-bold">
            Challenge Progress
          </Text>

          <Text className="text-purple-100 mt-1">
            Keep going and earn rewards
          </Text>

          <View className="flex-row justify-between mt-5">
            <View>
              <Text className="text-white text-2xl font-bold">1</Text>
              <Text className="text-purple-100">Active</Text>
            </View>

            <View>
              <Text className="text-white text-2xl font-bold">
                {workoutHistory ? workoutHistory.total : 0}
              </Text>
              <Text className="text-purple-100">Workout</Text>
            </View>

            <View>
              <Text className="text-white text-2xl font-bold">100</Text>
              <Text className="text-purple-100">Target</Text>
            </View>
          </View>
        </View>

        <View className="mx-5 mt-4 mb-2">
          <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-100">
            <Ionicons name="search-outline" size={22} color="#9CA3AF" />

            <TextInput
              placeholder="Cari challenge..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              className="flex-1 ml-3 text-base text-gray-800"
            />
          </View>
        </View>
        <FlatList
          data={filteredData ? filteredData : challenges}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 15,
            paddingBottom: 120,
          }}
          renderItem={({ item }) => <ChallengeCard item={item} />}
        />
        {/* <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-2 pt-5 pb-32"
          showsVerticalScrollIndicator={false}
        ></ScrollView> */}
      </ContainerPage>
    </>
  );
}

function ChallengeCard({ item }: { item: any }) {
  const router = useRouter();
  const { user, signOut } = useAuth();

  console.log("useruser", user);

  const {
    mutate: workoutHistoryFn,
    data: workoutHistory,
    isPending: isPendingWorkout,
  } = useWorkoutHistory();

  React.useEffect(() => {
    async function getWorkout() {
      let joined_year = new Date().getFullYear();
      let joined_month = new Date().getMonth();
      await workoutHistoryFn({ year: joined_year, month: joined_month });
    }
    getWorkout();
  }, []);
  const current_progress = workoutHistory ? workoutHistory.total : 0;
  const percentage = Math.min(
    (current_progress / item.variable_target) * 100,
    100,
  );

  const onDetail = () => {
    router.push({
      pathname: "/challenges/detail",
      params: { data: JSON.stringify(item) }, //{ ...data, bank: { ...data.bank } },
    });
  };

  const imageChallengeURL = (fileName?: string) => {
    if (!fileName) {
      return "https://placehold.co/600x400/png";
    }
    return `${PATH_PUBLIC_IMAGE_REWARD}/${fileName}`;
  };

  const getTargetChallenge = () => {
    if (current_progress > item.variable_target) {
      return item.variable_target;
    }
    return current_progress;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className="bg-white rounded-3xl mb-5 overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      {/* Banner Image */}
      <Image
        source={{
          uri: imageChallengeURL(item.picture),
        }}
        style={{
          width: "100%",
          height: 180,
        }}
        resizeMode="cover"
        // className="w-full h-44"
        // resizeMode="cover"
      />

      {/* Status Badge */}
      <View
        className={`absolute top-4 right-4 px-3 py-2 rounded-full ${
          item.status === "aktif" ? "bg-green-500" : "bg-red-500"
        }`}
      >
        <Text className="text-white text-xs font-bold">
          {getTargetChallenge() >= item.variable_target
            ? "🏆 COMPLETED"
            : "ACTIVE"}
          {/* {item.status.toUpperCase()} */}
        </Text>
      </View>
      {/* <View className="flex-row items-center mt-4">
        <MaterialCommunityIcons
          name="calendar-check"
          size={18}
          color="#16A34A"
        />

        <Text className="ml-2 text-gray-600">Selesai pada 25 Jan 2026</Text>
      </View> */}

      <View className="p-5">
        {/* Header */}
        <View className="flex-row items-center">
          <View className="w-14 h-14 rounded-full bg-purple-100 items-center justify-center">
            <MaterialCommunityIcons
              name="trophy-award"
              size={28}
              color="#6F3FA0"
            />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-xl font-bold text-gray-800">
              {item.challenge}
            </Text>

            <Text className="text-gray-500 capitalize">
              {item.type} Challenge
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View className="mt-5">
          <View className="flex-row justify-between">
            <Text className="text-gray-500">Progress</Text>

            <Text className="font-bold text-purple-600">
              {Math.round(percentage)}%
            </Text>
          </View>

          <View className="h-3 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <View
              className="h-full bg-purple-600 rounded-full"
              style={{
                width: `${percentage}%`,
              }}
            />
          </View>

          <Text className="text-gray-600 mt-2">
            {getTargetChallenge()} / {item.variable_target} Workout
          </Text>
        </View>

        {/* Info */}
        <View className="flex-row justify-between mt-5">
          <View className="items-center">
            <Text className="text-gray-400 text-xs">Sequence</Text>

            <Text className="font-bold text-gray-800">#{item.sequence}</Text>
          </View>

          <View className="items-center">
            <Text className="text-gray-400 text-xs">Target</Text>

            <Text className="font-bold text-gray-800">
              {item.variable_target}
            </Text>
          </View>

          <View className="items-center">
            <Text className="text-gray-400 text-xs">Type</Text>

            <Text className="font-bold text-gray-800 capitalize">
              {item.type}
            </Text>
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity
          className="bg-purple-600 py-3 rounded-2xl mt-5"
          onPress={onDetail}
        >
          <Text className="text-center text-white font-semibold">
            View Challenge
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
