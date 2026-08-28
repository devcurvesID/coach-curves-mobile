import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import { useAuth } from "@/context/auth";
import { useInfiniteMemberAppointments } from "@/hooks/useWeighMeasure";
import { imageProfileURL } from "@/services/image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PAGE_SIZE = 10;

interface AppointmentUser {
  name: string;
  email?: string | null;
  photo?: string | null;
}

interface MemberAppointment {
  _id: string;
  user_id: string;
  user: AppointmentUser;
  app_date: string;
  app_hour?: string | null;
  status?: boolean | string | null;
  key_tag_id?: string | null;
  phone?: string | number | null;
}

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const getPhotoUrl = (photo: string): string =>
  /^https?:\/\//i.test(photo) ? photo : imageProfileURL(photo);

const isCompleted = (status: MemberAppointment["status"]): boolean => {
  if (status === true) return true;
  if (typeof status !== "string") return false;
  return ["completed", "done", "true"].includes(status.toLowerCase());
};

const formatAppointmentDate = (value: string): string => {
  const date = dayjs(value);
  return date.isValid() ? date.format("DD MMM YYYY") : "Tanggal tidak tersedia";
};

const formatAppointmentTime = (value?: string | null): string => {
  if (!value) return "Jam belum ditentukan";
  return `${value.slice(0, 5)} WIB`;
};

const getScheduleStatus = (appointmentDate: string) => {
  const date = dayjs(appointmentDate);
  if (!date.isValid()) {
    return {
      text: "Tanggal jadwal tidak valid",
      icon: "alert-circle-outline" as const,
      color: "#DC2626",
      textClass: "text-red-600 dark:text-red-300",
      containerClass: "bg-red-50 dark:bg-red-950",
    };
  }

  const dayDifference = dayjs().startOf("day").diff(date.startOf("day"), "day");

  if (dayDifference > 0) {
    return {
      text: `Terlambat ${dayDifference} hari`,
      icon: "alert-circle-outline" as const,
      color: "#DC2626",
      textClass: "text-red-600 dark:text-red-300",
      containerClass: "bg-red-50 dark:bg-red-950",
    };
  }

  if (dayDifference < 0) {
    return {
      text: `${Math.abs(dayDifference)} hari lagi`,
      icon: "calendar-outline" as const,
      color: "#2563EB",
      textClass: "text-blue-600 dark:text-blue-300",
      containerClass: "bg-blue-50 dark:bg-blue-950",
    };
  }

  return {
    text: "Sesuai jadwal hari ini",
    icon: "checkmark-circle-outline" as const,
    color: "#16A34A",
    textClass: "text-green-600 dark:text-green-300",
    containerClass: "bg-green-50 dark:bg-green-950",
  };
};

function MemberAvatar({ appointment }: { appointment: MemberAppointment }) {
  if (appointment.user.photo) {
    return (
      <Image
        source={{ uri: getPhotoUrl(appointment.user.photo) }}
        className="h-16 w-16 rounded-2xl bg-violet-100"
      />
    );
  }

  return (
    <View className="h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950">
      <Text className="text-xl font-bold text-[#6F3FA0]">
        {getInitials(appointment.user.name)}
      </Text>
    </View>
  );
}

function AppointmentCard({
  appointment,
  onInput,
  onHistory,
}: {
  appointment: MemberAppointment;
  onInput: () => void;
  onHistory: () => void;
}) {
  const completed = isCompleted(appointment.status);
  const scheduleStatus = getScheduleStatus(appointment.app_date);

  return (
    <View className="mx-5 mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <View className="p-5">
        <View className="flex-row items-start">
          <MemberAvatar appointment={appointment} />

          <View className="ml-4 flex-1">
            <View className="flex-row items-start justify-between">
              <View className="mr-2 flex-1">
                <Text
                  numberOfLines={1}
                  className="text-lg font-bold text-gray-900 dark:text-white"
                >
                  {appointment.user.name}
                </Text>
                <Text
                  numberOfLines={1}
                  className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                >
                  {appointment.user.email || "Email belum tersedia"}
                </Text>
              </View>

              <View
                className={`rounded-full px-2.5 py-1 ${
                  completed
                    ? "bg-green-50 dark:bg-green-950"
                    : "bg-amber-50 dark:bg-amber-950"
                }`}
              >
                <Text
                  className={`text-[10px] font-bold ${
                    completed
                      ? "text-green-700 dark:text-green-300"
                      : "text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {completed ? "SELESAI" : "MENUNGGU WM"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-5 flex-row rounded-2xl bg-violet-50 p-4 dark:bg-violet-950">
          <View className="flex-1 border-r border-violet-200 pr-3 dark:border-violet-800">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              TANGGAL
            </Text>
            <View className="mt-1.5 flex-row items-center">
              <Ionicons name="calendar-outline" size={17} color="#6F3FA0" />
              <Text className="ml-1.5 font-bold text-gray-900 dark:text-white">
                {formatAppointmentDate(appointment.app_date)}
              </Text>
            </View>
          </View>
          <View className="flex-1 pl-4">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              JAM
            </Text>
            <View className="mt-1.5 flex-row items-center">
              <Ionicons name="time-outline" size={17} color="#6F3FA0" />
              <Text className="ml-1.5 font-bold text-gray-900 dark:text-white">
                {formatAppointmentTime(appointment.app_hour)}
              </Text>
            </View>
          </View>
        </View>

        <View
          className={`mt-3 flex-row items-center rounded-xl px-3 py-2.5 ${scheduleStatus.containerClass}`}
        >
          <Ionicons
            name={scheduleStatus.icon}
            size={18}
            color={scheduleStatus.color}
          />
          <Text
            className={`ml-2 text-sm font-semibold ${scheduleStatus.textClass}`}
          >
            {scheduleStatus.text}
          </Text>
        </View>

        {(appointment.key_tag_id || appointment.phone) && (
          <View className="mt-4 gap-3">
            {appointment.key_tag_id && (
              <View className="flex-row items-center">
                <Ionicons name="key-outline" size={18} color="#6F3FA0" />
                <Text className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                  Key Tag: {appointment.key_tag_id}
                </Text>
              </View>
            )}
            {appointment.phone && (
              <View className="flex-row items-center">
                <Ionicons name="call-outline" size={18} color="#6F3FA0" />
                <Text className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                  {String(appointment.phone)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={completed ? onHistory : onInput}
        activeOpacity={0.85}
        className={`flex-row items-center justify-center py-4 ${
          completed ? "bg-green-50 dark:bg-green-950" : "bg-[#6F3FA0]"
        }`}
      >
        <Ionicons
          name={completed ? "time-outline" : "create-outline"}
          size={20}
          color={completed ? "#15803D" : "white"}
        />
        <Text
          className={`ml-2 font-bold ${
            completed ? "text-green-700 dark:text-green-300" : "text-white"
          }`}
        >
          {completed ? "Lihat Riwayat WM" : "Isi Hasil WM"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ListMemberWMToday() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useInfiniteMemberAppointments({
    staffId: user?._id,
    limit: PAGE_SIZE,
  });

  const appointments = useMemo(
    () =>
      (data?.pages.flatMap((page) => page.response) ??
        []) as MemberAppointment[],
    [data],
  );
  const totalAppointments = data?.pages[0]?.total ?? appointments.length;
  const completedCount = appointments.filter((appointment) =>
    isCompleted(appointment.status),
  ).length;
  const pendingCount = appointments.length - completedCount;

  const openInputWM = (appointment: MemberAppointment) => {
    router.push({
      pathname: "/user/input-wm",
      params: { id: appointment.user_id },
    });
  };

  const openWMHistory = (appointment: MemberAppointment) => {
    router.push({
      pathname: "/member-history/wm-history",
      params: { id: appointment.user_id },
    });
  };

  if (isLoading && appointments.length === 0) return <LoadingView />;

  return (
    <ContainerPage titleHeader="WM Hari Ini" titleContent="Jadwal Penimbangan">
      <FlatList
        data={appointments}
        keyExtractor={(appointment, index) =>
          appointment._id || `${appointment.user_id}-${index}`
        }
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            onInput={() => openInputWM(item)}
            onHistory={() => openWMHistory(item)}
          />
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={() => void refetch()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
        ListHeaderComponent={
          <View>
            <View className="mx-5 mb-4 mt-5 rounded-3xl bg-[#6F3FA0] p-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-violet-200">
                    Jadwal Weigh & Measure hari ini
                  </Text>
                  <Text className="mt-1 text-3xl font-bold text-white">
                    {totalAppointments}
                  </Text>
                  <Text className="mt-1 text-xs text-violet-200">
                    {hasNextPage
                      ? `${appointments.length} dari ${totalAppointments} jadwal dimuat`
                      : `${pendingCount} menunggu • ${completedCount} selesai`}
                  </Text>
                </View>
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                  <MaterialCommunityIcons
                    name="scale-bathroom"
                    size={30}
                    color="white"
                  />
                </View>
              </View>
            </View>

            {appointments.length > 0 && (
              <View className="mx-5 mb-4">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  Daftar Member
                </Text>
                <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {appointments.length} dari {totalAppointments} jadwal
                  ditampilkan
                </Text>
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="items-center py-5">
              <ActivityIndicator color="#6F3FA0" />
              <Text className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Memuat jadwal berikutnya...
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8 pb-20">
            <View
              className={`mb-4 rounded-full p-5 ${
                error ? "bg-red-50" : "bg-violet-50 dark:bg-violet-950"
              }`}
            >
              <Ionicons
                name={error ? "alert-circle-outline" : "calendar-outline"}
                size={42}
                color={error ? "#DC2626" : "#6F3FA0"}
              />
            </View>
            <Text className="text-center text-lg font-bold text-gray-800 dark:text-white">
              {error
                ? "Jadwal WM gagal dimuat"
                : "Tidak ada jadwal WM hari ini"}
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-gray-500 dark:text-gray-400">
              {error
                ? "Tarik layar ke bawah untuk mencoba kembali."
                : "Belum ada member yang dijadwalkan melakukan penimbangan hari ini."}
            </Text>
          </View>
        }
      />
    </ContainerPage>
  );
}
