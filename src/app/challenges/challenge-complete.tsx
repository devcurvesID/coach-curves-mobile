import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import { useAuth } from "@/context/auth";
import {
  CompletedUserChallenge,
  useCompletedUserChallenges,
} from "@/hooks/useChallenges";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

function RewardCard({ item }: { item: CompletedUserChallenge }) {
  const completedDate = new Date(item.updated_at);
  const dateLabel = Number.isNaN(completedDate.getTime())
    ? "Tanggal belum tersedia"
    : completedDate.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  return (
    <View className="mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-white ">
      <View className="bg-[#6F3FA0] p-5">
        <View className="flex-row items-start justify-between">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
            <MaterialCommunityIcons
              name="trophy-award"
              size={31}
              color="white"
            />
          </View>
          <View className="flex-row items-center rounded-full bg-white/20 px-3 py-2">
            <Ionicons name="checkmark-circle" size={17} color="white" />
            <Text className="ml-1.5 text-xs font-bold text-white">SELESAI</Text>
          </View>
        </View>
        <Text className="mt-5 text-xl font-bold text-white">
          {item.challenge.challenge}
        </Text>
        <Text className="mt-2 text-sm text-violet-100">
          Target {item.challenge.variable_target} workout tercapai
        </Text>
      </View>
      <View className="p-5">
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-gray-50 p-4 ">
            <Text className="text-xs text-gray-500">Diselesaikan</Text>
            <Text className="mt-2 font-bold text-gray-900 ">{dateLabel}</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-gray-50 p-4 ">
            <Text className="text-xs text-gray-500">Status hadiah</Text>
            <Text
              className={`mt-2 font-bold ${
                item.is_claimed ? "text-green-600" : "text-violet-600"
              }`}
            >
              {item.is_claimed ? "Sudah diklaim" : "Belum diklaim"}
            </Text>
          </View>
        </View>
        {item.notes ? (
          <Text className="mt-4 rounded-2xl bg-violet-50 p-4 text-gray-700">
            {item.notes}
          </Text>
        ) : null}
        {!item.is_claimed ? (
          <View className="mt-4 flex-row items-center rounded-2xl bg-amber-50 p-4">
            <Ionicons name="gift-outline" size={21} color="#D97706" />
            <Text className="ml-2 flex-1 text-sm text-amber-700">
              Hubungi staff club untuk proses klaim reward.
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function CompletedChallengesScreen() {
  const { user } = useAuth();
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useCompletedUserChallenges(user?._id);

  if (isLoading) return <LoadingView />;

  return (
    <ContainerPage
      titleHeader="Rewards"
      titleContent="Challenge yang telah diselesaikan"
    >
      <FlatList
        data={data}
        renderItem={({ item }) => <RewardCard item={item} />}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
        refreshing={isLoading}
        onRefresh={() => void refetch()}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8 pb-20">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-purple-50">
              <MaterialCommunityIcons
                name={isError ? "alert-circle-outline" : "trophy-outline"}
                size={47}
                color={isError ? "#DC2626" : "#9333EA"}
              />
            </View>
            <Text className="mt-5 text-center text-xl font-bold text-gray-900 ">
              {isError ? "Rewards gagal dimuat" : "Belum ada challenge selesai"}
            </Text>
            <Text className="mt-2 text-center text-sm text-gray-500">
              {isError
                ? "Periksa koneksi Anda lalu coba kembali."
                : "Challenge yang selesai akan ditampilkan di halaman ini."}
            </Text>
            {isError ? (
              <TouchableOpacity
                onPress={() => void refetch()}
                className="mt-5 rounded-xl bg-purple-600 px-5 py-3"
              >
                <Text className="font-bold text-white">Coba Lagi</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
      />
    </ContainerPage>
  );
}
