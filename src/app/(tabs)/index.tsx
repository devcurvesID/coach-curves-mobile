import { InfoMemberCard } from "@/components/profile/info-member";
import Text from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { formatDate } from "@/helpers/dates";
import { useMemberTotal } from "@/hooks/useMember";
import { useClubMemberPayments } from "@/hooks/usePayments";
import { usePublicities } from "@/hooks/usePublicities";
import { useMemberAppointmentByStaffId } from "@/hooks/useWeighMeasure";
import { useMemberWorkoutToday } from "@/hooks/useWorkout";
import { socket } from "@/services/socket";
import { PATH_PUBLIC_IMAGE_PUBLICITY } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CountResponse {
  total?: number;
}

interface Publicity {
  _id: string;
  photo?: string | null;
  headline: string;
  from_date: string;
  thru_date: string;
}

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  iconBackgroundColor: string;
  isLoading?: boolean;
  isError?: boolean;
  isUnavailable?: boolean;
  subtitle: string;
  onPress?: () => void;
}

const getClubId = (club: unknown): string | undefined => {
  if (typeof club === "string") return club;
  if (club && typeof club === "object" && "_id" in club) {
    const clubId = (club as { _id?: unknown })._id;
    return typeof clubId === "string" ? clubId : undefined;
  }

  return undefined;
};

const getPublicityImageUrl = (fileName?: string | null): string => {
  if (!fileName) return "";
  return `${PATH_PUBLIC_IMAGE_PUBLICITY}/${fileName}`;
};

function SummaryCard({
  title,
  value,
  icon,
  iconColor,
  iconBackgroundColor,
  isLoading = false,
  isError = false,
  isUnavailable = false,
  subtitle,
  onPress,
}: SummaryCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${title}: ${isLoading ? "Memuat" : isError ? "Gagal dimuat" : isUnavailable ? "Total belum tersedia" : value}`}
      activeOpacity={onPress ? 0.8 : 1}
      className="mb-3 w-[48%] rounded-3xl border border-gray-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-2xl"
        style={{ backgroundColor: iconBackgroundColor }}
      >
        <Ionicons name={icon} size={23} color={iconColor} />
      </View>

      <View className="mt-5 h-9 justify-center">
        {isLoading ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : (
          <Text className="text-3xl font-bold" style={{ color: iconColor }}>
            {isError || isUnavailable ? "—" : value}
          </Text>
        )}
      </View>
      <Text className="mt-1 font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </Text>
      <View className="mt-2 flex-row items-center">
        <Text className="mr-1 flex-1 text-xs text-gray-500 dark:text-gray-400">
          {isError ? "Gagal dimuat • tarik untuk mencoba lagi" : subtitle}
        </Text>
        {onPress && (
          <Ionicons name="arrow-forward" size={15} color={iconColor} />
        )}
      </View>
    </TouchableOpacity>
  );
}

function PromoCarouselCard({
  item,
  onPress,
}: {
  item: Publicity;
  onPress: () => void;
}) {
  const { width } = useWindowDimensions();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`Lihat promo ${item.headline}`}
      className="overflow-hidden rounded-3xl border border-gray-100 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      style={{ width: Math.min(width - 64, 420) }}
    >
      {item.photo ? (
        <Image
          source={{ uri: getPublicityImageUrl(item.photo) }}
          resizeMode="cover"
          className="h-[180px] w-full"
        />
      ) : (
        <View className="h-[180px] items-center justify-center bg-violet-100 dark:bg-violet-950">
          <Ionicons name="megaphone-outline" size={44} color="#6F3FA0" />
        </View>
      )}
      <View className="p-4">
        <View className="self-start rounded-full bg-pink-100 px-3 py-1">
          <Text className="text-xs font-bold text-pink-600">PROMO</Text>
        </View>
        <Text
          numberOfLines={2}
          className="mt-3 text-lg font-bold text-gray-800 dark:text-white"
        >
          {item.headline}
        </Text>
        <Text className="mt-2 text-gray-500">
          {formatDate(item.from_date)} - {formatDate(item.thru_date)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function QuickAction({
  title,
  description,
  icon,
  onPress,
}: {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      activeOpacity={0.8}
      className="mb-3 flex-row items-center rounded-2xl border border-gray-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-950">
        <Ionicons name={icon} size={24} color="#8B5CF6" />
      </View>
      <View className="mx-3 flex-1">
        <Text className="font-bold text-gray-900 dark:text-white">{title}</Text>
        <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  console.log("user", user);

  const user_personal = user.user_personal;
  const coach_club_id = user_personal.member_club_id
    ? user_personal.member_club_id
    : user?.club_id?.[0];
  const coachClubId = getClubId(coach_club_id);
  const {
    data: totalMembers = 0,
    isLoading: isLoadingMembers,
    isError: isMembersError,
    refetch: refreshMembers,
  } = useMemberTotal(coach_club_id);
  const {
    data: publicityData = [],
    isLoading: isLoadingPromos,
    isError: isPromosError,
    refetch: refreshPromos,
  } = usePublicities();
  const {
    data: workoutData,
    isLoading: isLoadingWorkout,
    isError: isWorkoutError,
    refetch: refreshWorkoutMembers,
  } = useMemberWorkoutToday(coachClubId);
  const {
    mutate: loadAppointments,
    mutateAsync: refreshAppointments,
    data: appointmentData,
    isPending: isLoadingAppointments,
    isError: isAppointmentsError,
  } = useMemberAppointmentByStaffId();
  const {
    refetch: refreshMemberBills,
    data: billingData,
    isLoading: isLoadingBills,
    isError: isBillsError,
  } = useClubMemberPayments(coach_club_id);

  useEffect(() => {
    if (!user?._id) return;

    socket.emit("user-curves", `${user._id}_${user.source_id}`);
    loadAppointments(coach_club_id);
  }, [loadAppointments, user?._id, user?.source_id, coach_club_id]);

  const refreshDashboard = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        refreshPromos(),
        ...(coach_club_id
          ? [refreshMembers(), refreshWorkoutMembers(), refreshMemberBills()]
          : []),
        ...(user?._id ? [refreshAppointments(coach_club_id)] : []),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const promos = (
    Array.isArray(publicityData) ? publicityData : []
  ) as Publicity[];
  const workoutTotal = workoutData?.pages[0]?.total ?? 0;
  const appointmentTotal =
    (appointmentData as CountResponse | undefined)?.total ?? 0;
  const billingTotal = billingData?.pages[0]?.total;

  const openPublicity = (publicity: Publicity) => {
    router.push({
      pathname: "/publicities/detail",
      params: { data: JSON.stringify(publicity) },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F7FC] dark:bg-[#121212]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-32 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshDashboard}
            tintColor="#8B5CF6"
            colors={["#6F3FA0"]}
          />
        }
      >
        <View className="mb-6 overflow-hidden rounded-3xl">
          <LinearGradient
            colors={["#6F3FA0", "#482477"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 24 }}
          >
            <View className="mb-4 flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#E9D5FF" />
              <Text className="ml-2 text-sm text-violet-200">
                {formatDate(new Date().toISOString())}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-white">
              Halo, {user?.name || "Coach"}!
            </Text>
            <Text className="mt-2 text-sm leading-5 text-violet-100">
              Pantau aktivitas member dan bantu mereka mencapai target hari ini.
            </Text>
          </LinearGradient>
        </View>

        <View>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Ringkasan Aktivitas
          </Text>
          <Text className="mb-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ketuk kartu untuk melihat daftar member.
          </Text>

          <View className="flex-row flex-wrap justify-between">
            <SummaryCard
              title="WO Hari Ini"
              subtitle="Member yang workout hari ini"
              value={workoutTotal}
              icon="barbell-outline"
              iconColor="#16A34A"
              iconBackgroundColor="#F3E8FF"
              isLoading={isLoadingWorkout}
              isError={isWorkoutError || !coach_club_id}
              onPress={() => router.push("/list-member/member-wo")}
            />
            <SummaryCard
              title="Total Member"
              subtitle="Member terdaftar di club"
              value={totalMembers}
              icon="people-outline"
              iconColor="#7C3AED"
              iconBackgroundColor="#F3E8FF"
              isLoading={isLoadingMembers}
              isError={isMembersError || !coach_club_id}
              onPress={() => router.push("/list-member")}
            />
            <SummaryCard
              title="WM Hari Ini"
              subtitle="Lihat jadwal penimbangan"
              value={appointmentTotal}
              icon="scale-outline"
              iconColor="#EA580C"
              iconBackgroundColor="#FFEDD5"
              isLoading={isLoadingAppointments}
              isError={isAppointmentsError}
              onPress={() => router.push("/list-member/member-wm")}
            />
            <SummaryCard
              title="Tagihan Anggota"
              subtitle={
                billingTotal === 0
                  ? "Belum ada tagihan di club"
                  : "Lihat daftar pembayaran club"
              }
              value={billingTotal ?? 0}
              icon="card-outline"
              iconColor="#2563EB"
              iconBackgroundColor="#DBEAFE"
              isLoading={isLoadingBills}
              isError={isBillsError || !coach_club_id}
              isUnavailable={!isLoadingBills && billingTotal === undefined}
              onPress={() => router.push("/list-member/member-payments")}
            />
          </View>
        </View>

        <View className="mt-5">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Menu Cepat
          </Text>
          <Text className="mb-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
            Akses informasi yang Anda butuhkan.
          </Text>
          <QuickAction
            title="Member per Flag"
            description="Lihat member berdasarkan kategori flag"
            icon="flag-outline"
            onPress={() => router.push("/list-member/by-flag")}
          />
          <QuickAction
            title="Peringkat Member"
            description="Lihat peringkat keseluruhan dan bulanan member"
            icon="trophy-outline"
            onPress={() => router.push("/user/rank-history")}
          />
          <QuickAction
            title="Kalender"
            description="Lihat tanggal dan daily challenge"
            icon="calendar-outline"
            onPress={() => router.push("/calendar")}
          />
          <QuickAction
            title="Promo"
            description="Lihat promo bulanan dan promo mitra"
            icon="pricetag-outline"
            onPress={() => router.push("/publicities")}
          />
        </View>

        <View className="mt-6">
          <TouchableOpacity
            className="mb-4 flex-row items-center justify-between py-2"
            accessibilityRole="button"
            onPress={() => router.push("/publicities")}
          >
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Promo Terbaru
            </Text>
            <Text className="font-semibold text-violet-600 dark:text-violet-300">
              Lihat Semua →
            </Text>
          </TouchableOpacity>

          <FlatList
            horizontal
            data={promos}
            ListEmptyComponent={
              <View className="rounded-2xl bg-white p-5 dark:bg-zinc-900">
                {isLoadingPromos ? (
                  <ActivityIndicator color="#6F3FA0" />
                ) : (
                  <Ionicons
                    name="megaphone-outline"
                    size={26}
                    color="#8B5CF6"
                  />
                )}
                <Text className="mt-3 font-semibold text-gray-800 dark:text-white">
                  {isLoadingPromos
                    ? "Memuat promo..."
                    : isPromosError
                      ? "Promo belum berhasil dimuat"
                      : "Belum ada promo tersedia"}
                </Text>
                <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {isPromosError
                    ? "Tarik layar ke bawah untuk mencoba kembali."
                    : "Informasi penawaran club akan tampil di sini."}
                </Text>
              </View>
            }
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className="w-4" />}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <PromoCarouselCard
                item={item}
                onPress={() => openPublicity(item)}
              />
            )}
          />
        </View>
        <View className="mt-7">
          <Text className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Informasi Akun
          </Text>
          <InfoMemberCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
