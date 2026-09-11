import {
  useCheckCurrentChallengeCompletion,
  useCurrentUserChallenge,
} from "@/hooks/useChallenges";
import { rewardImageURL } from "@/services/image";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

interface CurrentChallengeCardProps {
  userId?: string;
}

export const CurrentChallengeCard = ({ userId }: CurrentChallengeCardProps) => {
  const {
    data: challenge,
    isLoading,
    isError,
    refetch,
  } = useCurrentUserChallenge(userId);
  useCheckCurrentChallengeCompletion(userId, challenge?._id);

  return (
    <View className="mb-5 overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm">
      <View className="flex-row items-center justify-between px-5 pb-4 pt-5">
        <View className="flex-1 pr-3">
          <Text className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Challenge Saat Ini
          </Text>
          <Text className="mt-1 text-lg font-bold text-slate-900">
            Target Berikutnya
          </Text>
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-amber-100">
          <Ionicons name="trophy-outline" size={23} color="#D97706" />
        </View>
      </View>

      {isLoading ? (
        <View className="items-center px-5 pb-7 pt-2">
          <ActivityIndicator color="#6F3FA0" />
          <Text className="mt-2 text-xs text-slate-500">
            Memuat challenge...
          </Text>
        </View>
      ) : isError ? (
        <View className="mx-5 mb-5 items-center rounded-2xl bg-red-50 p-4">
          <Text className="text-center text-xs text-red-600">
            Challenge saat ini gagal dimuat.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Muat ulang challenge member"
            onPress={() => void refetch()}
            className="mt-3 rounded-xl bg-red-600 px-4 py-2.5"
          >
            <Text className="text-xs font-bold text-white">Coba Lagi</Text>
          </Pressable>
        </View>
      ) : !challenge ? (
        <View className="mx-5 mb-5 items-center rounded-2xl bg-slate-50 p-6">
          <Ionicons name="ribbon-outline" size={28} color="#94A3B8" />
          <Text className="mt-2 text-center text-xs leading-5 text-slate-500">
            Belum ada challenge yang sedang berjalan.
          </Text>
        </View>
      ) : (
        <View className="mx-5 mb-5 overflow-hidden rounded-2xl bg-purple-50">
          {challenge.picture ? (
            <Image
              source={{ uri: rewardImageURL(challenge.picture) }}
              className="h-32 w-full"
              resizeMode="cover"
              accessibilityLabel={"Gambar challenge " + challenge.challenge}
            />
          ) : null}
          <View className="p-4">
            <View className="flex-row items-start justify-between">
              <View className="mr-3 flex-1">
                <Text className="text-base font-black text-slate-900">
                  {challenge.challenge}
                </Text>
                <Text className="mt-1 text-xs capitalize text-slate-500">
                  Challenge {challenge.type}
                </Text>
              </View>
              <View className="rounded-full bg-emerald-100 px-3 py-1.5">
                <Text className="text-[10px] font-bold uppercase text-emerald-700">
                  {challenge.status}
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row rounded-2xl bg-white p-3">
              <View className="flex-1 items-center border-r border-purple-100">
                <Text className="text-[10px] font-semibold uppercase text-slate-400">
                  Target
                </Text>
                <Text className="mt-1 text-base font-black text-purple-700">
                  {challenge.variable_target}
                </Text>
                <Text className="text-[10px] text-slate-500">Workout</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-[10px] font-semibold uppercase text-slate-400">
                  Tahapan
                </Text>
                <Text className="mt-1 text-base font-black text-slate-800">
                  #{challenge.sequence ?? "-"}
                </Text>
                <Text className="text-[10px] text-slate-500">Challenge</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
