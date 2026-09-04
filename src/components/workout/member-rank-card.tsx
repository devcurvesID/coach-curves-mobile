import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { MemberRank } from "@/types/rank";
import React from "react";
import { Pressable, Text, View } from "react-native";

const PURPLE = "#9333EA";
const DARK_PURPLE = "#6F3FA0";
interface MemberRankCardProps {
  item: MemberRank;
  rank: number;
  onPress?: (item: MemberRank) => void;
}

const getRankStyle = (
  rank: number,
): {
  background: string;
  text: string;
  icon: string;
} => {
  switch (rank) {
    case 1:
      return {
        background: "bg-amber-100",
        text: "text-amber-600",
        icon: "#D97706",
      };

    case 2:
      return {
        background: "bg-slate-200",
        text: "text-slate-600",
        icon: "#64748B",
      };

    case 3:
      return {
        background: "bg-orange-100",
        text: "text-orange-600",
        icon: "#EA580C",
      };

    default:
      return {
        background: "bg-purple-100",
        text: "text-purple-600",
        icon: PURPLE,
      };
  }
};
const formatDifference = (value: string, maximumFractionDigits = 1): string => {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return "0";
  }

  return Math.abs(numberValue).toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });
};

const isReduction = (value: string): boolean => {
  return Number(value) < 0;
};

const getDifferenceColor = (value: string): string => {
  const difference = Number(value);

  if (difference < 0) return "text-emerald-600";
  if (difference > 0) return "text-orange-500";
  return "text-slate-500";
};

const formatRankDate = (value?: string): string => {
  if (!value) return "Tanggal belum tersedia";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const MemberRankCard = ({ item, rank, onPress }: MemberRankCardProps) => {
  const rankStyle = getRankStyle(rank);

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={() => onPress?.(item)}
      className={`mb-4 overflow-hidden rounded-[26px] border border-gray-100 bg-white ${
        onPress ? "active:opacity-90" : ""
      }`}
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: {
          width: 0,
          height: 5,
        },
        elevation: 3,
      }}
    >
      <View className="px-5 py-5">
        <View className="flex-row items-center">
          <View
            className={[
              "h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
              rankStyle.background,
            ].join(" ")}
          >
            {rank <= 3 ? (
              <MaterialCommunityIcons
                name="trophy-award"
                size={29}
                color={rankStyle.icon}
              />
            ) : (
              <Text className={["text-xl font-bold", rankStyle.text].join(" ")}>
                {rank}
              </Text>
            )}
          </View>

          <View className="ml-4 min-w-0 flex-1">
            <Text
              numberOfLines={1}
              className="text-[19px] font-bold text-slate-900"
            >
              {item.user.name}
            </Text>

            <View className="mt-1 flex-row items-center">
              <Ionicons name="location-outline" size={15} color="#94A3B8" />

              <Text
                numberOfLines={1}
                className="ml-1.5 flex-1 text-sm text-slate-400"
              >
                {item.club.club_name}
              </Text>
            </View>
          </View>

          <View className="ml-3 items-end">
            <Text className="text-xs text-slate-400">Peringkat</Text>

            <Text
              className={["mt-1 text-xl font-bold", rankStyle.text].join(" ")}
            >
              #{rank}
            </Text>
          </View>
        </View>

        <View className="my-5 h-px bg-gray-100" />

        <View className="mb-5 flex-row items-center rounded-2xl bg-slate-50 px-4 py-3">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-white">
            <Ionicons name="calendar-outline" size={18} color={DARK_PURPLE} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-xs text-slate-400">Periode penilaian</Text>
            <Text className="mt-0.5 text-sm font-bold text-slate-700">
              {formatRankDate(item.wm_date ?? item.created_at)}
            </Text>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-base font-bold text-slate-800">
            Hasil Perubahan
          </Text>
          <Text className="mt-1 text-xs leading-5 text-slate-400">
            Dibandingkan dengan hasil pengukuran periode sebelumnya
          </Text>
        </View>

        <View className="flex-row">
          <View className="flex-1 items-center">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <MaterialCommunityIcons
                name="scale-bathroom"
                size={20}
                color={PURPLE}
              />
            </View>

            <Text className="mt-2 text-center text-xs text-slate-400">
              Berat Badan
            </Text>

            <Text
              className={`mt-1 text-base font-bold ${getDifferenceColor(
                item.weigh_diff,
              )}`}
            >
              {isReduction(item.weigh_diff) ? "-" : "+"}
              {formatDifference(item.weigh_diff)} kg
            </Text>
          </View>

          <View className="mx-2 w-px bg-gray-100" />

          <View className="flex-1 items-center">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <MaterialCommunityIcons
                name="tape-measure"
                size={21}
                color={PURPLE}
              />
            </View>

            <Text className="mt-2 text-center text-xs text-slate-400">
              Ukuran Tubuh
            </Text>

            <Text
              className={`mt-1 text-base font-bold ${getDifferenceColor(
                item.size_diff,
              )}`}
            >
              {isReduction(item.size_diff) ? "-" : "+"}
              {formatDifference(item.size_diff)} cm
            </Text>
          </View>

          <View className="mx-2 w-px bg-gray-100" />

          <View className="flex-1 items-center">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <MaterialCommunityIcons
                name="percent-outline"
                size={20}
                color={PURPLE}
              />
            </View>

            <Text className="mt-2 text-center text-xs text-slate-400">
              Lemak Tubuh
            </Text>

            <Text
              className={`mt-1 text-base font-bold ${getDifferenceColor(
                item.body_fat_diff,
              )}`}
            >
              {isReduction(item.body_fat_diff) ? "-" : "+"}
              {formatDifference(item.body_fat_diff)}%
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row items-center justify-between rounded-2xl bg-purple-50 px-4 py-3.5">
          <View className="flex-row items-center">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-white">
              <MaterialCommunityIcons
                name="dumbbell"
                size={19}
                color={PURPLE}
              />
            </View>

            <View className="ml-3">
              <Text className="text-xs text-slate-400">
                Workout periode penilaian
              </Text>

              <Text className="mt-0.5 text-base font-bold text-purple-600">
                {item.wo_count} kali latihan
              </Text>
            </View>
          </View>

          {onPress ? (
            <Ionicons name="chevron-forward" size={21} color={PURPLE} />
          ) : (
            <View className="rounded-full bg-white px-3 py-1.5">
              <Text className="text-[10px] font-bold text-purple-600">
                Dasar ranking
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default MemberRankCard;
