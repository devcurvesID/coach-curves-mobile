import { InfoMemberCard } from "@/components/profile/info-member";
import MenuTile from "@/components/ui/menu-tile";
import Text from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { formatDate } from "@/helpers/dates";
import { useMemberTotal } from "@/hooks/useMember";
import { useMemberOfBillPaymentByStaffId } from "@/hooks/usePayments";
import { usePublicities } from "@/hooks/usePublicities";
import { useMemberAppointmentByStaffId } from "@/hooks/useWeighMeasure";
import { useMemberWorkoutToday } from "@/hooks/useWorkout";
import { socket } from "@/services/socket";
import { PATH_PUBLIC_IMAGE_PUBLICITY } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
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
  if (!fileName) return "https://placehold.co/600x400/png";
  return `${PATH_PUBLIC_IMAGE_PUBLICITY}/${fileName}`;
};

function SummaryCard({
  title,
  value,
  icon,
  iconColor,
  iconBackgroundColor,
  isLoading = false,
  onPress,
}: SummaryCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.8 : 1}
      className="mb-4 w-[48%] rounded-3xl bg-white p-4 shadow"
    >
      <View
        className="h-[55px] w-[55px] items-center justify-center rounded-[18px]"
        style={{ backgroundColor: iconBackgroundColor }}
      >
        <Ionicons name={icon} size={28} color={iconColor} />
      </View>

      <View className="mt-5 h-9 justify-center">
        {isLoading ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : (
          <Text className="text-3xl font-bold" style={{ color: iconColor }}>
            {value}
          </Text>
        )}
      </View>
      <Text className="mt-1 text-gray-500">{title}</Text>
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
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="overflow-hidden rounded-3xl bg-white"
      style={{ width: Dimensions.get("window").width * 0.82 }}
    >
      <Image
        source={{ uri: getPublicityImageUrl(item.photo) }}
        resizeMode="cover"
        className="h-[180px] w-full"
      />
      <View className="p-4">
        <View className="self-start rounded-full bg-pink-100 px-3 py-1">
          <Text className="text-xs font-bold text-pink-600">PROMO</Text>
        </View>
        <Text
          numberOfLines={2}
          className="mt-3 text-lg font-bold text-gray-800"
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

export default function DashboardScreen() {
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const clubId = getClubId(user?.club_id?.[0]);

  const { data: totalMembers = 0, isLoading: isLoadingMembers } =
    useMemberTotal(clubId);
  const { data: publicityData = [] } = usePublicities();
  const {
    mutate: loadWorkoutMembers,
    data: workoutData,
    isPending: isLoadingWorkout,
  } = useMemberWorkoutToday();
  const {
    mutate: loadAppointments,
    data: appointmentData,
    isPending: isLoadingAppointments,
  } = useMemberAppointmentByStaffId();
  const {
    mutate: loadMemberBills,
    data: billingData,
    isPending: isLoadingBills,
  } = useMemberOfBillPaymentByStaffId();

  useEffect(() => {
    if (!user?._id) return;

    socket.emit("user-curves", `${user._id}_${user.source_id}`);
    loadWorkoutMembers(user._id);
    loadAppointments(user._id);
    loadMemberBills(user._id);
  }, [
    loadAppointments,
    loadMemberBills,
    loadWorkoutMembers,
    user?._id,
    user?.source_id,
  ]);

  const gradientColors = useMemo<[string, string]>(
    () =>
      colorScheme === "dark" ? ["#6F3FA0", "#BB86FC"] : ["#BB86FC", "#6F3FA0"],
    [colorScheme],
  );

  const promos = publicityData as Publicity[];
  const workoutTotal = (workoutData as CountResponse | undefined)?.total ?? 0;
  const appointmentTotal =
    (appointmentData as CountResponse | undefined)?.total ?? 0;
  const billingTotal = (billingData as CountResponse | undefined)?.total ?? 0;

  const openPublicity = (publicity: Publicity) => {
    router.push({
      pathname: "/publicities/detail",
      params: { data: JSON.stringify(publicity) },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
      <ImageBackground
        source={require("@/assets/images/bgcurveslightnew.png")}
        resizeMode="cover"
        className="absolute inset-0"
      />
      <View
        pointerEvents="none"
        className="absolute -top-24 left-0 right-0 h-[320px] overflow-hidden rounded-b-[60px]"
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-40 pt-8"
        showsVerticalScrollIndicator={false}
      >
        <InfoMemberCard />

        <View className="mt-6 px-5">
          <Text className="mb-4 text-2xl font-bold text-white">
            Ringkasan Hari Ini
          </Text>

          <View className="flex-row flex-wrap justify-between">
            <SummaryCard
              title="WO Hari Ini"
              value={workoutTotal}
              icon="barbell-outline"
              iconColor="#16A34A"
              iconBackgroundColor="#F3E8FF"
              isLoading={isLoadingWorkout}
              onPress={() => router.push("/list-member/member-wo")}
            />
            <SummaryCard
              title="Total Member"
              value={totalMembers}
              icon="people-outline"
              iconColor="#7C3AED"
              iconBackgroundColor="#F3E8FF"
              isLoading={isLoadingMembers}
              onPress={() => router.push("/list-member")}
            />
            <SummaryCard
              title="WM Hari Ini"
              value={appointmentTotal}
              icon="scale-outline"
              iconColor="#EA580C"
              iconBackgroundColor="#FFEDD5"
              isLoading={isLoadingAppointments}
              onPress={() => router.push("/list-member/member-wm")}
            />
            <SummaryCard
              title="Tagihan Anggota"
              value={billingTotal}
              icon="card-outline"
              iconColor="#2563EB"
              iconBackgroundColor="#DBEAFE"
              isLoading={isLoadingBills}
            />
          </View>
        </View>

        <View className="pt-5">
          <View className="mt-4 flex-row gap-4">
            <MenuTile
              onPress={() => router.push("/user/weigh-measure")}
              title={"Weigh & \rMeasure"}
              icon={<Ionicons name="calendar" size={22} color="#F8BBD0" />}
            />
            <MenuTile
              onPress={() => router.push("/user/attendance")}
              title="Workout History"
              icon={<Ionicons name="bar-chart" size={22} color="#F8BBD0" />}
            />
          </View>
        </View>

        <View className="mt-6">
          <TouchableOpacity
            className="mb-3 flex-row items-center justify-between px-5"
            onPress={() => router.push("/publicities")}
          >
            <Text className="text-xl font-bold">Promo Terbaru</Text>
            <Text>Lihat Semua</Text>
          </TouchableOpacity>

          <FlatList
            horizontal
            data={promos}
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
      </ScrollView>
    </SafeAreaView>
  );
}
