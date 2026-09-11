import { CurrentChallengeCard } from "@/components/challenge/current-challenge-card";
import { InformationWorkOutView } from "@/components/profile/information-workout";
import { ProfileCardView } from "@/components/profile/profile-card";
import { FullscreenImage } from "@/components/ui/fullscreen-image";
import { LoadingView } from "@/components/ui/loading";
import { LastWorkoutCard } from "@/components/workout/last-workout-card";
import { useAuth } from "@/context/auth";
import { getDateTime } from "@/helpers/dates";
import {
  useClubWorkoutHistory,
  useLastWorkout,
  useLastWorkoutSocket,
} from "@/hooks/useWorkout";
import { socket } from "@/services/socket";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const getClubId = (club: unknown): string | undefined => {
  if (typeof club === "string") return club.trim() || undefined;
  if (typeof club === "number" && Number.isFinite(club)) return String(club);
  if (club && typeof club === "object" && "_id" in club) {
    return getClubId(club._id);
  }
  return undefined;
};

const getCurrentWeek = (today: Date): Date[] => {
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - mondayOffset,
  );

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
};

const TodayCalendar = () => {
  const today = React.useMemo(() => new Date(), []);
  const currentWeek = React.useMemo(() => getCurrentWeek(today), [today]);
  const formattedDate = React.useMemo(
    () =>
      new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(today),
    [today],
  );

  return (
    <View className="mt-5 overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm">
      <View className="flex-row items-center justify-between px-5 pb-4 pt-5">
        <View className="flex-1 pr-3">
          <Text className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Kalender Hari Ini
          </Text>
          <Text className="mt-1 capitalize text-base font-bold text-slate-900">
            {formattedDate}
          </Text>
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-purple-100">
          <Ionicons name="today-outline" size={23} color="#6F3FA0" />
        </View>
      </View>

      <View className="mx-3 flex-row rounded-2xl bg-slate-50 px-1 py-3">
        {currentWeek.map((date, index) => {
          const isToday = date.getDate() === today.getDate();

          return (
            <View key={date.toISOString()} className="flex-1 items-center">
              <Text
                className={`text-[10px] font-semibold ${
                  isToday ? "text-purple-700" : "text-slate-400"
                }`}
              >
                {DAY_LABELS[index]}
              </Text>
              <View
                className={`mt-1.5 h-9 w-9 items-center justify-center rounded-full ${
                  isToday ? "bg-purple-600" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    isToday ? "text-white" : "text-slate-700"
                  }`}
                >
                  {date.getDate()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Buka kalender lengkap"
        onPress={() => router.push("/calendar")}
        className="mt-3 flex-row items-center justify-center border-t border-purple-100 px-5 py-4"
      >
        <Text className="font-bold text-purple-700">Lihat Kalender</Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color="#6F3FA0"
          style={styles.calendarActionIcon}
        />
      </Pressable>
    </View>
  );
};

const ClubWorkoutHistoryCard = ({ clubId }: { clubId?: string }) => {
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useClubWorkoutHistory(clubId);
  const lastSixDays = React.useMemo(
    () =>
      data
        .filter((item) => dayjs(item.workoutDate).isValid())
        .slice(0, 6)
        .map((item) => ({
          date: dayjs(item.workoutDate),
          total: item.total,
        }))
        .sort((first, second) => second.date.valueOf() - first.date.valueOf()),
    [data],
  );
  const totalVisits = lastSixDays.reduce((sum, item) => sum + item.total, 0);
  const maximumTotal = Math.max(...lastSixDays.map((item) => item.total), 1);

  return (
    <View className="mb-5 overflow-hidden rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="mr-3 flex-1">
          <Text className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Aktivitas Club
          </Text>
          <Text className="mt-1 text-lg font-bold text-slate-900">
            Workout 6 Hari Terakhir
          </Text>
          <Text className="mt-1 text-xs text-slate-500">
            Jumlah member yang melakukan latihan
          </Text>
        </View>
        <View className="items-end rounded-2xl bg-purple-100 px-3 py-2">
          <Text className="text-[10px] font-semibold uppercase text-purple-500">
            Total
          </Text>
          <Text className="text-xl font-black text-purple-700">
            {isLoading ? "-" : totalVisits}
          </Text>
        </View>
      </View>

      {!clubId ? (
        <View className="mt-5 flex-row items-center rounded-2xl bg-amber-50 p-4">
          <Ionicons name="alert-circle-outline" size={20} color="#D97706" />
          <Text className="ml-2 flex-1 text-xs leading-5 text-amber-700">
            Club pengguna belum tersedia.
          </Text>
        </View>
      ) : isLoading ? (
        <View className="items-center py-8">
          <ActivityIndicator color="#6F3FA0" />
          <Text className="mt-2 text-xs text-slate-500">
            Memuat aktivitas club...
          </Text>
        </View>
      ) : isError ? (
        <View className="mt-5 items-center rounded-2xl bg-red-50 p-4">
          <Ionicons name="alert-circle-outline" size={24} color="#DC2626" />
          <Text className="mt-2 text-center text-xs text-red-600">
            Aktivitas club gagal dimuat.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void refetch()}
            className="mt-3 rounded-xl bg-red-600 px-4 py-2.5"
          >
            <Text className="text-xs font-bold text-white">Coba Lagi</Text>
          </Pressable>
        </View>
      ) : lastSixDays.length === 0 ? (
        <View className="mt-5 items-center rounded-2xl bg-slate-50 p-6">
          <Ionicons name="barbell-outline" size={28} color="#94A3B8" />
          <Text className="mt-2 text-center text-xs text-slate-500">
            Belum ada aktivitas workout club yang dapat ditampilkan.
          </Text>
        </View>
      ) : (
        <View className="mt-5 flex-row items-end justify-between rounded-2xl bg-slate-50 px-3 pb-3 pt-4">
          {lastSixDays.map((item, index) => {
            const barHeight = 10 + (item.total / maximumTotal) * 46;
            const isLatest = index === 0;

            return (
              <View
                key={item.date.format("YYYY-MM-DD")}
                className="flex-1 items-center"
              >
                <Text className="mb-1 text-xs font-bold text-slate-700">
                  {item.total}
                </Text>
                <View
                  className={`w-5 rounded-t-lg ${
                    isLatest ? "bg-purple-600" : "bg-purple-300"
                  }`}
                  style={{ height: barHeight }}
                />
                <Text
                  className={`mt-2 text-[10px] font-semibold ${
                    isLatest ? "text-purple-700" : "text-slate-400"
                  }`}
                >
                  {new Intl.DateTimeFormat("id-ID", {
                    weekday: "short",
                  })
                    .format(item.date.toDate())
                    .slice(0, 3)}
                </Text>
                <Text className="mt-0.5 text-[9px] text-slate-400">
                  {item.date.format("DD/MM")}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const MemberQrCode = ({
  memberName,
  keyTagId,
}: {
  memberName: string;
  keyTagId: string;
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const qrSize = Math.max(Math.min(screenWidth - 128, 330), 180);

  const renderQrCode = (size: number) => (
    <View style={styles.qrCard}>
      <QRCode
        value={keyTagId}
        logo={require("@/assets/images/logocurves.png")}
        logoSize={size > 350 ? 48 : 40}
        logoBackgroundColor="#F2F2F2"
        color="#8B5CF6"
        backgroundColor="#FFFFFF"
        quietZone={12}
        size={size}
      />
    </View>
  );

  return (
    <View style={styles.qrSection}>
      <FullscreenImage
        accessibilityLabel="Buka QR code dalam layar penuh"
        thumbnailSize={qrSize + 40}
        thumbnail={renderQrCode(qrSize)}
        fullscreenContent={({ width: modalWidth }) =>
          renderQrCode(Math.min(modalWidth - 64, 420))
        }
      />
      <View style={styles.memberInformation}>
        <Text style={styles.memberName}>{memberName}</Text>
        <Text style={styles.memberId}>MEMBER ID • {keyTagId}</Text>
        <Text style={styles.qrHint}>Ketuk QR untuk memperbesar</Text>
      </View>
    </View>
  );
};

const WorkOutScreen = () => {
  useLastWorkoutSocket();

  const { user, isLoading, onReloadUserMobile } = useAuth();
  const clubId = getClubId(user?.user_personal?.member_club_id);
  const userId = user?._id ? String(user._id) : undefined;
  const {
    data: lastWorkout,
    error,
    isLoading: isLoadingLastWorkout,
    refetch,
  } = useLastWorkout();
  console.log("lastWorkout", lastWorkout);

  React.useEffect(() => {
    console.log("socket.connected", socket.connected);
    socket.emit("user-curves", `${user._id}_${user.source_id}`);

    // socket.on("workout", (data) => {
    //   console.log("notif workout => ", data);
    // });

    // socket.on("notification", async (data) => {
    //   onReloadUserMobile();
    // });
    // return () => {
    //   socket.off("notification");
    // };
  }, []);
  if (isLoadingLastWorkout) {
    return <LoadingView />;
  }

  const checkIsWorkOutToday = () => {
    if (!lastWorkout) {
      return false;
    }
    let curr_date = getDateTime(new Date());
    let last_workout = getDateTime(new Date(lastWorkout.workout_date));
    console.log(curr_date, last_workout);
    if (curr_date === last_workout) {
      return true;
    }
    return false;
  };
  const colors: [string, string] = ["#BB86FC", "#6F3FA0"];
  if (isLoading) {
    return <LoadingView />;
  }
  return (
    <SafeAreaView className="flex-1 bg-[#FFFFFF] ">
      <ImageBackground
        source={require("@/assets/images/bgcurveslightnew.png")}
        resizeMode="cover"
        className="absolute inset-0"
      />
      <View
        pointerEvents="none"
        className="absolute -top-24 left-0 right-0 h-[320px] rounded-b-[60px] overflow-hidden"
        style={{
          backgroundColor: "transparent",
          shadowColor: "#000",
        }}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0.1, y: 0.0 }}
          end={{ x: 0.9, y: 1.0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-8 pb-40"
        showsVerticalScrollIndicator={false}
      >
        <ProfileCardView />
        <View className="mb-5">
          <TodayCalendar />
        </View>
        <ClubWorkoutHistoryCard clubId={clubId} />
        <CurrentChallengeCard userId={userId} />
        {checkIsWorkOutToday() ? (
          <InformationWorkOutView />
        ) : (
          <>
            <View className="pt-5">
              {/* <SectionTitle>Your Weekly Progress</SectionTitle> */}

              {/* QR CONTAINER */}
              <MemberQrCode
                memberName={user.name}
                keyTagId={String(user.user_personal.key_tag_id)}
              />
            </View>
          </>
        )}

        <View className="mt-5">
          <LastWorkoutCard
            workout={lastWorkout ?? null}
            isError={Boolean(error)}
            onRetry={() => void refetch()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkOutScreen;

const styles = StyleSheet.create({
  qrSection: { alignItems: "center", justifyContent: "center" },
  calendarActionIcon: { marginLeft: 4 },
  qrCard: {
    padding: 20,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  memberInformation: { alignItems: "center", marginTop: 20 },
  memberName: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
  memberId: { marginTop: 4, fontSize: 13, color: "rgba(255,255,255,0.72)" },
  qrHint: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: "hidden",
    borderRadius: 16,
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.86)",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
});
