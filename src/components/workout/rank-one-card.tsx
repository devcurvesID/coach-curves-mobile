import { useAuth } from "@/context/auth";
import { imageProfileURL } from "@/services/image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

export type RankOneCardData = {
  weigh_diff: string | number;
  size_diff: string | number;
  body_fat_diff: string | number;
  wo_count: number;
  club?: {
    club_name: string;
  };
};

type RankOneCardProps = {
  data: RankOneCardData;
  isDetailLoading?: boolean;
  onPressDetail?: () => void;
  member?: {
    name?: string | null;
    photo?: string | null;
  };
  detailLabel?: string;
};

const formatNumber = (value: string | number, decimal: number = 1): string => {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    return "0";
  }

  return Math.abs(parsedValue).toFixed(decimal);
};
const isReduction = (value: string | number): boolean => {
  return Number(value) < 0;
};
const formatClubName = (clubName?: string): string => {
  if (!clubName) {
    return "-";
  }

  return clubName
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getPhotoUrl = (photo: string): string =>
  /^https?:\/\//i.test(photo) ? photo : imageProfileURL(photo);

export default function RankOneCard({
  data,
  isDetailLoading = false,
  onPressDetail,
  member,
  detailLabel = "Lihat Detail Pengukuran",
}: RankOneCardProps) {
  const { user } = useAuth();
  const userPersonal = user?.user_personal;
  const displayName = member?.name?.trim() || user?.name || "Member";
  const displayPhoto = member ? member.photo?.trim() : userPersonal?.photo;
  const [hasPhotoError, setHasPhotoError] = useState(false);

  useEffect(() => setHasPhotoError(false), [displayPhoto]);

  return (
    <View className="mx-4 mt-4 overflow-hidden rounded-3xl bg-white shadow-lg">
      <LinearGradient
        colors={["#7C3AED", "#9333EA", "#C084FC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-5 pb-6 pt-5"
      >
        <View className="flex-row items-center justify-between">
          <View className="rounded-full bg-white/20 px-4 py-2">
            <Text className="text-xs font-semibold uppercase tracking-wider text-white">
              Weight Loss Ranking
            </Text>
          </View>

          <View className="h-12 w-12 items-center justify-center rounded-full bg-yellow-400">
            <MaterialCommunityIcons name="crown" size={28} color="#78350F" />
          </View>
        </View>

        <View className="mt-5 items-center">
          <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-yellow-300 bg-white">
            {/* <MaterialCommunityIcons name="account" size={46} color="#7C3AED" /> */}
            {displayPhoto && !hasPhotoError ? (
              <Image
                source={{ uri: getPhotoUrl(displayPhoto) }}
                accessibilityLabel={`Foto profil ${displayName}`}
                onError={() => setHasPhotoError(true)}
                className="h-[72px] w-[72px] rounded-full"
              />
            ) : (
              <MaterialCommunityIcons
                name="account"
                size={46}
                color="#7C3AED"
              />
            )}
          </View>

          {/* <View className="mt-6 rounded-full bg-yellow-400 px-4 py-1">
            <Text className="text-sm font-bold text-yellow-950">
              Peringkat #1
            </Text>
          </View> */}

          <Text
            className="mt-5 text-center text-2xl font-bold text-white"
            numberOfLines={2}
          >
            {displayName}
          </Text>

          <View className="mt-2 flex-row items-center">
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color="#E9D5FF"
            />

            <Text
              className="ml-1 max-w-[280px] text-center text-sm text-purple-100"
              numberOfLines={2}
            >
              {formatClubName(data.club?.club_name)}
            </Text>
          </View>
        </View>

        <View className="rounded-2xl bg-white/15 px-5 py-4">
          <Text className="text-center text-sm font-medium text-purple-100">
            Total Selisih Berat Tubuh
          </Text>

          <View className="mt-1 flex-row items-end justify-center">
            <Text className="text-4xl font-bold text-white">
              {isReduction(data.weigh_diff) ? "-" : "+"}
              {formatNumber(data.weigh_diff)}
            </Text>

            <Text className="mb-1 ml-1 text-lg font-semibold text-white">
              kg
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View className="px-5 py-5">
        <Text className="text-base font-bold text-slate-800">
          Detail Pencapaian
        </Text>

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 items-center rounded-2xl bg-purple-50 px-2 py-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <MaterialCommunityIcons
                name="weight-lifter"
                size={22}
                color="#7C3AED"
              />
            </View>

            <Text className="mt-2 text-lg font-bold text-slate-800">
              {isReduction(data.weigh_diff) ? "-" : "+"}
              {formatNumber(data.weigh_diff)}
            </Text>

            <Text className="text-center text-xs text-slate-500">
              Berat Badan
            </Text>
          </View>

          <View className="flex-1 items-center rounded-2xl bg-purple-50 px-2 py-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <MaterialCommunityIcons
                name="tape-measure"
                size={22}
                color="#7C3AED"
              />
            </View>

            <Text className="mt-2 text-lg font-bold text-slate-800">
              {isReduction(data.size_diff) ? "-" : "+"}
              {formatNumber(data.size_diff)}
            </Text>

            <Text className="text-center text-xs text-slate-500">
              Ukuran Tubuh
            </Text>
          </View>

          <View className="flex-1 items-center rounded-2xl bg-purple-50 px-2 py-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <MaterialCommunityIcons
                name="percent"
                size={22}
                color="#7C3AED"
              />
            </View>

            <Text className="mt-2 text-lg font-bold text-slate-800">
              {isReduction(data.body_fat_diff) ? "-" : "+"}
              {formatNumber(data.body_fat_diff)}
            </Text>

            <Text className="text-center text-xs text-slate-500">
              Lemak Tubuh
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center rounded-2xl bg-slate-50 px-4 py-4">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-purple-100">
            <MaterialCommunityIcons name="dumbbell" size={23} color="#7C3AED" />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-xs font-medium text-slate-500">
              Total Workout Periode Pengukuran
            </Text>

            <Text className="text-base font-bold text-slate-800">
              {data.wo_count} kali latihan
            </Text>

            <Text className="mt-1 text-xs leading-4 text-slate-500">
              Jumlah latihan yang digunakan dalam perhitungan hasil di atas.
            </Text>
          </View>

          <MaterialCommunityIcons name="medal" size={30} color="#F59E0B" />
        </View>

        {onPressDetail && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Lihat detail hasil pengukuran"
            disabled={isDetailLoading}
            onPress={onPressDetail}
            className={`mt-4 flex-row items-center justify-center rounded-2xl bg-purple-600 px-5 py-4 ${
              isDetailLoading ? "opacity-70" : "active:bg-purple-700"
            }`}
          >
            {isDetailLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons
                name="chart-line"
                size={21}
                color="#FFFFFF"
              />
            )}
            <Text className="ml-2 text-base font-bold text-white">
              {isDetailLoading ? "Menyiapkan Data..." : detailLabel}
            </Text>
            {!isDetailLoading && (
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color="#FFFFFF"
              />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}
