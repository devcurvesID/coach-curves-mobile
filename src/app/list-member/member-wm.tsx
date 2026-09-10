import { WMConfirmationModal } from "@/components/member-detail/wm-confirmation-modal";
import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import { useAuth } from "@/context/auth";
import { useInfiniteMemberAppointments } from "@/hooks/useWeighMeasure";
import { imageProfileURL } from "@/services/image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

function KeyTagSearchModal({
  visible,
  initialValue,
  onClose,
  onSearch,
}: {
  visible: boolean;
  initialValue: string;
  onClose: () => void;
  onSearch: (keyTagId: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (visible) {
      setValue(initialValue);
      setError("");
    }
  }, [initialValue, visible]);

  const submit = () => {
    const keyTagId = value.trim();
    if (!keyTagId) {
      setError("Key Tag ID wajib diisi.");
      return;
    }
    onSearch(keyTagId);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center bg-black/50 px-6"
      >
        <Pressable
          onPress={onClose}
          accessible={false}
          className="absolute inset-0"
        />
        <View
          accessibilityViewIsModal
          className="rounded-3xl bg-white p-6 "
        >
          <View className="flex-row items-start justify-between">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 ">
              <Ionicons name="key-outline" size={28} color="#6F3FA0" />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tutup pencarian"
              onPress={onClose}
              className="h-11 w-11 items-center justify-center rounded-full bg-gray-100 "
            >
              <Ionicons name="close" size={22} color="#9CA3AF" />
            </Pressable>
          </View>
          <Text className="mt-5 text-2xl font-bold text-gray-900 ">
            Cari Jadwal Member
          </Text>
          <Text className="mt-2 text-sm leading-5 text-gray-500 ">
            Masukkan Key Tag ID member untuk menemukan jadwal penimbangannya.
          </Text>
          <View
            className={`mt-5 flex-row items-center rounded-2xl border px-4 ${error ? "border-red-400" : "border-gray-200 "}`}
          >
            <Ionicons name="key-outline" size={20} color="#6F3FA0" />
            <TextInput
              autoFocus
              value={value}
              onChangeText={(text) => {
                setValue(text);
                if (error) setError("");
              }}
              onSubmitEditing={submit}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Contoh: 990226314"
              placeholderTextColor="#9CA3AF"
              className="ml-3 flex-1 py-4 text-gray-900 "
            />
          </View>
          {error ? (
            <Text className="mt-2 text-xs text-red-600">{error}</Text>
          ) : null}
          <TouchableOpacity
            accessibilityRole="button"
            onPress={submit}
            activeOpacity={0.85}
            className="mt-6 flex-row items-center justify-center rounded-2xl bg-[#6F3FA0] py-4"
          >
            <Ionicons name="search-outline" size={19} color="white" />
            <Text className="ml-2 font-bold text-white">Cari Member</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onClose}
            className="mt-3 items-center rounded-2xl border border-gray-200 py-4 "
          >
            <Text className="font-semibold text-gray-600 ">
              Batal
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

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
      textClass: "text-red-600 ",
      containerClass: "bg-red-50 ",
    };
  }

  const dayDifference = dayjs().startOf("day").diff(date.startOf("day"), "day");

  if (dayDifference > 0) {
    return {
      text: `Terlambat ${dayDifference} hari`,
      icon: "alert-circle-outline" as const,
      color: "#DC2626",
      textClass: "text-red-600 ",
      containerClass: "bg-red-50 ",
    };
  }

  if (dayDifference < 0) {
    return {
      text: `${Math.abs(dayDifference)} hari lagi`,
      icon: "calendar-outline" as const,
      color: "#2563EB",
      textClass: "text-blue-600 ",
      containerClass: "bg-blue-50 ",
    };
  }

  return {
    text: "Sesuai jadwal hari ini",
    icon: "checkmark-circle-outline" as const,
    color: "#16A34A",
    textClass: "text-green-600 ",
    containerClass: "bg-green-50 ",
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
    <View className="h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 ">
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const completed = isCompleted(appointment.status);
  const scheduleStatus = getScheduleStatus(appointment.app_date);
  const appointmentDate = dayjs(appointment.app_date);
  const hasValidDate = appointmentDate.isValid();
  const isBeforeSchedule =
    hasValidDate &&
    appointmentDate.startOf("day").isAfter(dayjs().startOf("day"));

  const handleAction = () => {
    if (completed) {
      onHistory();
      return;
    }
    if (!hasValidDate) return;
    if (isBeforeSchedule) {
      setShowConfirmation(true);
      return;
    }
    onInput();
  };

  return (
    <>
      <View className="mx-5 mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm  ">
        <View className="p-5">
          <View className="flex-row items-start">
            <MemberAvatar appointment={appointment} />

            <View className="ml-4 flex-1">
              <View className="flex-row items-start justify-between">
                <View className="mr-2 flex-1">
                  <Text
                    numberOfLines={1}
                    className="text-lg font-bold text-gray-900 "
                  >
                    {appointment.user.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="mt-1 text-sm text-gray-500 "
                  >
                    {appointment.user.email || "Email belum tersedia"}
                  </Text>
                </View>

                <View
                  className={`rounded-full px-2.5 py-1 ${
                    completed
                      ? "bg-green-50 "
                      : "bg-amber-50 "
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${
                      completed
                        ? "text-green-700 "
                        : "text-amber-700 "
                    }`}
                  >
                    {completed ? "SELESAI" : "MENUNGGU WM"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="mt-5 flex-row rounded-2xl bg-violet-50 p-4 ">
            <View className="flex-1 border-r border-violet-200 pr-3 ">
              <Text className="text-xs text-gray-500 ">
                TANGGAL
              </Text>
              <View className="mt-1.5 flex-row items-center">
                <Ionicons name="calendar-outline" size={17} color="#6F3FA0" />
                <Text className="ml-1.5 font-bold text-gray-900 ">
                  {formatAppointmentDate(appointment.app_date)}
                </Text>
              </View>
            </View>
            <View className="flex-1 pl-4">
              <Text className="text-xs text-gray-500 ">
                JAM
              </Text>
              <View className="mt-1.5 flex-row items-center">
                <Ionicons name="time-outline" size={17} color="#6F3FA0" />
                <Text className="ml-1.5 font-bold text-gray-900 ">
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
                  <Text className="ml-3 text-sm text-gray-600 ">
                    Key Tag: {appointment.key_tag_id}
                  </Text>
                </View>
              )}
              {appointment.phone && (
                <View className="flex-row items-center">
                  <Ionicons name="call-outline" size={18} color="#6F3FA0" />
                  <Text className="ml-3 text-sm text-gray-600 ">
                    {String(appointment.phone)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleAction}
          disabled={!completed && !hasValidDate}
          accessibilityRole="button"
          accessibilityLabel={completed ? "Lihat riwayat WM" : "Isi hasil WM"}
          accessibilityHint={
            isBeforeSchedule
              ? "Menampilkan konfirmasi input sebelum jadwal"
              : undefined
          }
          accessibilityState={{ disabled: !completed && !hasValidDate }}
          activeOpacity={0.85}
          className={`flex-row items-center justify-center py-4 ${
            completed ? "bg-green-50 " : "bg-[#6F3FA0]"
          }`}
        >
          <Ionicons
            name={completed ? "time-outline" : "create-outline"}
            size={20}
            color={completed ? "#15803D" : "white"}
          />
          <Text
            className={`ml-2 font-bold ${
              completed ? "text-green-700 " : "text-white"
            }`}
          >
            {completed
              ? "Lihat Riwayat WM"
              : !hasValidDate
                ? "Jadwal Tidak Valid"
                : isBeforeSchedule
                  ? "Tetap Isi Hasil WM"
                  : "Isi Hasil WM"}
          </Text>
        </TouchableOpacity>
      </View>
      <WMConfirmationModal
        visible={showConfirmation && isBeforeSchedule && !completed}
        appointmentDate={appointmentDate.format("DD MMM YYYY")}
        onCancel={() => setShowConfirmation(false)}
        onConfirm={() => {
          setShowConfirmation(false);
          onInput();
        }}
      />
    </>
  );
}

export default function ListMemberWMToday() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [keyTagId, setKeyTagId] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [debouncedNameSearch, setDebouncedNameSearch] = useState("");

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedNameSearch(nameSearch.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [nameSearch]);

  const user_personal = user.user_personal;
  const coach_club_id = user_personal.member_club_id
    ? user_personal.member_club_id
    : user?.club_id?.[0];
  const clubId =
    typeof coach_club_id === "string"
      ? coach_club_id
      : coach_club_id &&
          typeof coach_club_id === "object" &&
          "_id" in coach_club_id
        ? String(coach_club_id._id)
        : undefined;
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
    club_id: clubId,
    key_tag_id: keyTagId || undefined,
    name: debouncedNameSearch || undefined,
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

  const isSearchingName =
    nameSearch.trim() !== debouncedNameSearch ||
    (Boolean(debouncedNameSearch) && isLoading);

  if (
    isLoading &&
    appointments.length === 0 &&
    !debouncedNameSearch &&
    !keyTagId
  ) {
    return <LoadingView />;
  }

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

            <View className="mx-5 mb-5">
              <View className="mb-3 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4  ">
                <Ionicons name="search-outline" size={20} color="#6F3FA0" />
                <TextInput
                  value={nameSearch}
                  onChangeText={(value) => {
                    setNameSearch(value);
                    if (value.trim()) setKeyTagId("");
                  }}
                  placeholder="Cari nama member..."
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="search"
                  autoCorrect={false}
                  className="ml-3 flex-1 py-4 text-gray-900 "
                  accessibilityLabel="Cari berdasarkan nama member"
                />
                {nameSearch ? (
                  <TouchableOpacity
                    onPress={() => setNameSearch("")}
                    accessibilityRole="button"
                    accessibilityLabel="Hapus pencarian nama"
                    className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 "
                  >
                    <Ionicons name="close" size={18} color="#6B7280" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {isSearchingName ? (
                <View className="mb-3 flex-row items-center px-1">
                  <ActivityIndicator size="small" color="#6F3FA0" />
                  <Text className="ml-2 text-xs text-gray-500 ">
                    Mencari member...
                  </Text>
                </View>
              ) : null}

              {keyTagId ? (
                <View className="rounded-2xl border border-violet-200 bg-violet-50 p-4  ">
                  <View className="flex-row items-center">
                    <Ionicons name="search-outline" size={20} color="#6F3FA0" />
                    <View className="ml-3 flex-1">
                      <Text className="text-xs text-gray-500 ">
                        Hasil pencarian Key Tag
                      </Text>
                      <Text className="mt-1 font-bold text-[#6F3FA0] ">
                        {keyTagId}
                      </Text>
                    </View>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="Ubah pencarian"
                      onPress={() => setIsSearchModalVisible(true)}
                      className="h-10 w-10 items-center justify-center rounded-full bg-white "
                    >
                      <Ionicons
                        name="pencil-outline"
                        size={19}
                        color="#6F3FA0"
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => setKeyTagId("")}
                    className="mt-3 self-start"
                  >
                    <Text className="text-xs font-semibold text-violet-700 ">
                      Hapus filter dan tampilkan semua
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => {
                    setNameSearch("");
                    setDebouncedNameSearch("");
                    setIsSearchModalVisible(true);
                  }}
                  activeOpacity={0.85}
                  className="flex-row items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 py-4  "
                >
                  <Ionicons name="search-outline" size={20} color="#6F3FA0" />
                  <Text className="ml-2 font-bold text-[#6F3FA0] ">
                    Cari Berdasarkan Key Tag
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {appointments.length > 0 && (
              <View className="mx-5 mb-4">
                <Text className="text-xl font-bold text-gray-900 ">
                  Daftar Member
                </Text>
                <Text className="mt-1 text-sm text-gray-500 ">
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
              <Text className="mt-2 text-xs text-gray-500 ">
                Memuat jadwal berikutnya...
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8 pb-20">
            <View
              className={`mb-4 rounded-full p-5 ${
                error ? "bg-red-50" : "bg-violet-50 "
              }`}
            >
              <Ionicons
                name={error ? "alert-circle-outline" : "calendar-outline"}
                size={42}
                color={error ? "#DC2626" : "#6F3FA0"}
              />
            </View>
            <Text className="text-center text-lg font-bold text-gray-800 ">
              {error
                ? "Jadwal WM gagal dimuat"
                : keyTagId || debouncedNameSearch
                  ? "Member tidak ditemukan"
                  : "Tidak ada jadwal WM hari ini"}
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-gray-500 ">
              {error
                ? "Tarik layar ke bawah untuk mencoba kembali."
                : keyTagId
                  ? `Tidak ada jadwal WM dengan Key Tag ${keyTagId}. Periksa kembali Key Tag yang dimasukkan.`
                  : debouncedNameSearch
                    ? `Tidak ada jadwal WM atas nama “${debouncedNameSearch}”. Coba gunakan nama lain.`
                  : "Belum ada member yang dijadwalkan melakukan penimbangan hari ini."}
            </Text>
          </View>
        }
      />
      <KeyTagSearchModal
        visible={isSearchModalVisible}
        initialValue={keyTagId}
        onClose={() => setIsSearchModalVisible(false)}
        onSearch={(value) => {
          setNameSearch("");
          setDebouncedNameSearch("");
          setKeyTagId(value);
          setIsSearchModalVisible(false);
        }}
      />
    </ContainerPage>
  );
}
