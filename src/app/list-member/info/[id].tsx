import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import { formatDate } from "@/helpers/dates";
import { getMemberFlagStyle } from "@/helpers/member-flag";
import { useChallengeSummaryByUserId } from "@/hooks/useChallenges";
import { useDetailMemberByUserId } from "@/hooks/useMember";
import {
  useMemberAppointmentByUserId,
  useWeighMeasureProgressByUserId,
} from "@/hooks/useWeighMeasure";
import { imageProfileURL } from "@/services/image";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface MemberDetail {
  _id?: string;
  user_id: string;
  user: {
    name: string;
    email?: string | null;
  };
  photo?: string | null;
  flag?: string | null;
  birth?: string | null;
  joined?: string | null;
  phone?: string | number | null;
  cellphone?: string | number | null;
  address?: string | null;
  postal?: string | number | null;
  key_tag_id?: string | null;
  tshirt_size?: number | null;
}

interface MemberAppointment {
  _id?: string;
  app_date: string;
  app_hour?: string | null;
  status?: boolean | string | null;
}

type MeasurementValue = string | number | null;

interface WeighMeasureRecord {
  wm_date: string;
  weight?: MeasurementValue;
  body_fat?: MeasurementValue;
  bmi?: MeasurementValue;
  total_measurement?: MeasurementValue;
}

interface WeighMeasureProgress {
  current?: WeighMeasureRecord | null;
  previous?: WeighMeasureRecord | null;
}

interface InformationRowProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value?: string | number | null;
  lines?: number;
}

interface ActionTileProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
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

const displayValue = (value?: string | number | null): string => {
  if (value === null || value === undefined) return "Belum tersedia";
  return String(value).trim() || "Belum tersedia";
};

const getTshirtSize = (size?: number | null): string => {
  const sizes: Record<number, string> = {
    1: "S",
    2: "M",
    3: "L",
    4: "XL",
    5: "XXL",
  };

  return size ? (sizes[size] ?? "-") : "-";
};

function InformationRow({
  icon,
  label,
  value,
  lines = 1,
}: InformationRowProps) {
  return (
    <View className="flex-row items-start border-b border-gray-100 py-4 last:border-b-0 dark:border-zinc-800">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
        <Ionicons name={icon} size={20} color="#6F3FA0" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {label}
        </Text>
        <Text
          numberOfLines={lines}
          className="mt-1 text-sm font-semibold text-gray-800 dark:text-white"
        >
          {displayValue(value)}
        </Text>
      </View>
    </View>
  );
}

function ActionTile({
  icon,
  title,
  subtitle,
  color,
  backgroundColor,
  onPress,
}: ActionTileProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mb-4 w-[48%] rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text className="mt-4 font-bold text-gray-900 dark:text-white">
        {title}
      </Text>
      <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {subtitle}
      </Text>
      <View className="mt-3 flex-row items-center">
        <Text className="mr-1 text-xs font-semibold" style={{ color }}>
          Buka
        </Text>
        <Ionicons name="arrow-forward" size={14} color={color} />
      </View>
    </TouchableOpacity>
  );
}

function ProgressMetric({
  label,
  current,
  previous,
  unit = "",
  favorable = "neutral",
}: {
  label: string;
  current?: MeasurementValue;
  previous?: MeasurementValue;
  unit?: string;
  favorable?: "increase" | "decrease" | "neutral";
}) {
  const hasValues =
    current !== null &&
    current !== undefined &&
    current !== "" &&
    previous !== null &&
    previous !== undefined &&
    previous !== "";
  const difference = hasValues ? Number(current) - Number(previous) : null;
  const hasValidDifference = difference !== null && Number.isFinite(difference);
  const isImprovement =
    hasValidDifference &&
    difference !== 0 &&
    ((favorable === "increase" && difference > 0) ||
      (favorable === "decrease" && difference < 0));
  const trendColor =
    !hasValidDifference || difference === 0
      ? "#9CA3AF"
      : favorable === "neutral"
        ? "#6F3FA0"
        : isImprovement
          ? "#16A34A"
          : "#DC2626";

  return (
    <View className="mb-3 w-[48%] rounded-2xl bg-gray-50 p-4 dark:bg-zinc-800">
      <Text className="text-xs text-gray-500 dark:text-gray-400">{label}</Text>
      <Text className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
        {current !== null && current !== undefined && current !== ""
          ? `${current}${unit}`
          : "-"}
      </Text>
      <Text
        className="mt-1 text-xs font-semibold"
        style={{ color: trendColor }}
      >
        {!hasValidDifference
          ? "Data pembanding belum tersedia"
          : difference === 0
            ? "● Tidak berubah"
            : `${difference > 0 ? "▲ +" : "▼ "}${difference.toFixed(1)}${unit}`}
      </Text>
      {previous !== null && previous !== undefined && previous !== "" && (
        <Text className="mt-1 text-[10px] text-gray-400">
          Sebelumnya {previous}
          {unit}
        </Text>
      )}
    </View>
  );
}

export default function DetailInformasiMemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    mutate: loadMemberDetail,
    data,
    isPending,
    isError,
  } = useDetailMemberByUserId();
  const { data: appointmentData, isLoading: isLoadingAppointment } =
    useMemberAppointmentByUserId(id);
  const { data: challengeSummary, isLoading: isLoadingChallengeSummary } =
    useChallengeSummaryByUserId(id);
  const {
    mutate: loadWeighMeasureProgress,
    data: weighMeasureProgressData,
    isPending: isPendingWeighMeasureProgress,
    isError: isWeighMeasureProgressError,
  } = useWeighMeasureProgressByUserId();

  useEffect(() => {
    if (!id) return;
    loadMemberDetail(id);
    loadWeighMeasureProgress(id);
  }, [id, loadMemberDetail, loadWeighMeasureProgress]);

  if (isPending && !data) return <LoadingView />;

  if (isError || !data) {
    return (
      <ContainerPage titleHeader="Detail Member" titleContent="Member">
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 rounded-full bg-red-50 p-5">
            <Ionicons name="alert-circle-outline" size={40} color="#DC2626" />
          </View>
          <Text className="text-center text-lg font-bold text-gray-800 dark:text-white">
            Informasi member gagal dimuat
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            Periksa koneksi Anda, lalu coba kembali.
          </Text>
          <TouchableOpacity
            onPress={() => id && loadMemberDetail(id)}
            className="mt-5 rounded-2xl bg-[#6F3FA0] px-6 py-3"
          >
            <Text className="font-bold text-white">Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </ContainerPage>
    );
  }

  const member = data as MemberDetail;
  const memberId = member.user_id || id;
  const memberFlagStyle = getMemberFlagStyle(member.flag);
  const weighMeasureProgress = weighMeasureProgressData as
    WeighMeasureProgress | null | undefined;
  const currentMeasurement = weighMeasureProgress?.current;
  const previousMeasurement = weighMeasureProgress?.previous;
  const hasWeighMeasureProgress = Boolean(
    currentMeasurement && previousMeasurement,
  );
  const appointments = (
    Array.isArray(appointmentData)
      ? appointmentData
      : appointmentData
        ? [appointmentData]
        : []
  ) as MemberAppointment[];
  const sortedAppointments = [...appointments].sort(
    (first, second) =>
      dayjs(first.app_date).valueOf() - dayjs(second.app_date).valueOf(),
  );
  const today = dayjs().startOf("day");
  const appointment =
    sortedAppointments
      .filter(
        (item) =>
          dayjs(item.app_date).isValid() &&
          !dayjs(item.app_date).startOf("day").isAfter(today),
      )
      .at(-1) ??
    sortedAppointments.find(
      (item) =>
        dayjs(item.app_date).isValid() &&
        dayjs(item.app_date).startOf("day").isAfter(today),
    );
  const appointmentDate = appointment ? dayjs(appointment.app_date) : null;
  const canInputWM = Boolean(
    appointmentDate?.isValid() &&
    !appointmentDate.startOf("day").isAfter(today),
  );

  return (
    <ContainerPage titleHeader="Detail Member" titleContent={member.user.name}>
      <ScrollView
        contentContainerClassName="px-5 pb-32 pt-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="overflow-hidden rounded-3xl bg-[#6F3FA0] shadow-sm">
          <View className="items-center px-5 py-7">
            {member.photo ? (
              <Image
                source={{ uri: imageProfileURL(member.photo) }}
                className="h-24 w-24 rounded-3xl border-4 border-white/30 bg-violet-100"
              />
            ) : (
              <View className="h-24 w-24 items-center justify-center rounded-3xl border-4 border-white/30 bg-white">
                <Text className="text-2xl font-bold text-[#6F3FA0]">
                  {getInitials(member.user.name)}
                </Text>
              </View>
            )}

            <Text className="mt-4 text-center text-2xl font-bold text-white">
              {member.user.name}
            </Text>
            <Text className="mt-1 text-center text-sm text-violet-200">
              {displayValue(member.user.email)}
            </Text>

            {member.flag && (
              <View className="mt-4 flex-row items-center">
                <View
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: memberFlagStyle.backgroundColor }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: memberFlagStyle.color }}
                  >
                    Flag {member.flag.toUpperCase()}
                  </Text>
                </View>
              </View>
            )}

            {isLoadingChallengeSummary ? (
              <View className="mt-5 flex-row items-center">
                <Ionicons name="sync-outline" size={16} color="#DDD6FE" />
                <Text className="ml-2 text-xs text-violet-200">
                  Memuat informasi challenge...
                </Text>
              </View>
            ) : challengeSummary ? (
              <View className="mt-5 w-full flex-row rounded-2xl bg-black/10 px-3 py-4">
                <View className="flex-1 items-center border-r border-white/20">
                  <Text className="text-xl font-bold text-white">
                    {challengeSummary.challenges_progress ?? 0}
                  </Text>
                  <Text className="mt-1 text-[10px] text-violet-200">
                    Berjalan
                  </Text>
                </View>
                <View className="flex-1 items-center border-r border-white/20">
                  <Text className="text-xl font-bold text-white">
                    {challengeSummary.total_workout ?? 0}
                  </Text>
                  <Text className="mt-1 text-[10px] text-violet-200">
                    Workout
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-xl font-bold text-white">
                    {challengeSummary.challenges_complete ?? 0}
                  </Text>
                  <Text className="mt-1 text-[10px] text-violet-200">
                    Selesai
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          <View className="flex-row bg-black/10 px-5 py-4">
            <View className="flex-1 items-center border-r border-white/20">
              <Text className="text-xs text-violet-200">KEY TAG</Text>
              <Text className="mt-1 font-bold text-white">
                {displayValue(member.key_tag_id)}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-xs text-violet-200">T-SHIRT</Text>
              <Text className="mt-1 font-bold text-white">
                {getTshirtSize(member.tshirt_size)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-5 rounded-3xl border border-gray-100 bg-white px-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <View className="border-b border-gray-100 py-5 dark:border-zinc-800">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              Informasi Pribadi
            </Text>
            <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Data identitas dan kontak member
            </Text>
          </View>
          <InformationRow
            icon="call-outline"
            label="Nomor Telepon"
            value={member.phone}
          />
          <InformationRow
            icon="phone-portrait-outline"
            label="Nomor Seluler"
            value={member.cellphone}
          />
          <InformationRow
            icon="calendar-outline"
            label="Tanggal Lahir"
            value={member.birth ? formatDate(member.birth) : null}
          />
          <InformationRow
            icon="location-outline"
            label="Alamat"
            value={member.address}
            lines={3}
          />
          <InformationRow
            icon="mail-outline"
            label="Kode Pos"
            value={member.postal}
          />
        </View>

        <View className="mt-5 flex-row items-center rounded-2xl bg-violet-50 p-4 dark:bg-violet-950">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-zinc-900">
            <Ionicons name="calendar" size={22} color="#6F3FA0" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Bergabung sejak
            </Text>
            <Text className="mt-1 font-bold text-[#6F3FA0] dark:text-violet-300">
              {member.joined ? formatDate(member.joined) : "Belum tersedia"}
            </Text>
          </View>
        </View>

        {isLoadingAppointment ? (
          <View className="mt-5 flex-row items-center justify-center rounded-3xl border border-gray-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <Ionicons name="sync-outline" size={20} color="#6F3FA0" />
            <Text className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              Memuat jadwal WM...
            </Text>
          </View>
        ) : appointment ? (
          <TouchableOpacity
            disabled={!canInputWM}
            activeOpacity={canInputWM ? 0.8 : 1}
            onPress={() =>
              router.push({
                pathname: "/user/input-wm",
                params: { id: memberId },
              })
            }
            className={`mt-5 overflow-hidden rounded-3xl border ${
              canInputWM
                ? "border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950"
                : "border-gray-200 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800"
            }`}
          >
            <View className="flex-row items-center p-5">
              <View
                className={`h-12 w-12 items-center justify-center rounded-2xl ${
                  canInputWM
                    ? "bg-white dark:bg-zinc-900"
                    : "bg-gray-200 dark:bg-zinc-700"
                }`}
              >
                <Ionicons
                  name="scale-outline"
                  size={24}
                  color={canInputWM ? "#6F3FA0" : "#9CA3AF"}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Jadwal WM Selanjutnya
                </Text>
                <Text className="mt-1 font-bold text-gray-900 dark:text-white">
                  {appointmentDate?.isValid()
                    ? appointmentDate.format("DD MMM YYYY")
                    : "Tanggal tidak tersedia"}
                  {appointment.app_hour
                    ? ` • ${appointment.app_hour.slice(0, 5)} WIB`
                    : ""}
                </Text>
                <Text
                  className={`mt-1 text-xs font-semibold ${
                    canInputWM
                      ? "text-[#6F3FA0] dark:text-violet-300"
                      : "text-red-500"
                  }`}
                >
                  {canInputWM
                    ? "Ketuk untuk mengisi hasil WM"
                    : "Jadwal penimbangan belum tiba"}
                </Text>
              </View>
              {canInputWM && (
                <Ionicons
                  name="arrow-forward-circle"
                  size={28}
                  color="#6F3FA0"
                />
              )}
            </View>
          </TouchableOpacity>
        ) : null}

        {isPendingWeighMeasureProgress ? (
          <View className="mt-5 flex-row items-center justify-center rounded-3xl border border-gray-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <Ionicons name="analytics-outline" size={20} color="#6F3FA0" />
            <Text className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              Memuat progres hasil latihan...
            </Text>
          </View>
        ) : isWeighMeasureProgressError ? (
          <View className="mt-5 flex-row items-center rounded-3xl border border-red-100 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950">
            <Ionicons name="alert-circle-outline" size={22} color="#DC2626" />
            <View className="ml-3 flex-1">
              <Text className="font-bold text-red-700 dark:text-red-300">
                Progres latihan gagal dimuat
              </Text>
              <Text className="mt-1 text-xs text-red-600 dark:text-red-400">
                Silakan muat ulang halaman untuk mencoba kembali.
              </Text>
            </View>
          </View>
        ) : hasWeighMeasureProgress ? (
          <View className="mt-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <View className="flex-row items-start justify-between">
              <View className="mr-3 flex-1">
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  Progres Hasil Latihan
                </Text>
                <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Perbandingan dua penimbangan terakhir
                </Text>
              </View>
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-950">
                <Ionicons name="analytics-outline" size={22} color="#6F3FA0" />
              </View>
            </View>

            <View className="mt-4 flex-row items-center rounded-xl bg-violet-50 px-3 py-2.5 dark:bg-violet-950">
              <Ionicons name="calendar-outline" size={17} color="#6F3FA0" />
              <Text className="ml-2 text-xs font-semibold text-[#6F3FA0] dark:text-violet-300">
                {formatDate(previousMeasurement!.wm_date)} →{" "}
                {formatDate(currentMeasurement!.wm_date)}
              </Text>
            </View>

            <View className="mt-4 flex-row flex-wrap justify-between">
              <ProgressMetric
                label="Berat Tubuh"
                previous={previousMeasurement!.weight}
                current={currentMeasurement!.weight}
                unit=" kg"
                favorable="decrease"
              />
              <ProgressMetric
                label="Body Fat"
                previous={previousMeasurement!.body_fat}
                current={currentMeasurement!.body_fat}
                unit="%"
                favorable="decrease"
              />
              <ProgressMetric
                label="BMI"
                previous={previousMeasurement!.bmi}
                current={currentMeasurement!.bmi}
              />
              <ProgressMetric
                label="Total Ukuran"
                previous={previousMeasurement!.total_measurement}
                current={currentMeasurement!.total_measurement}
                unit=" cm"
                favorable="decrease"
              />
            </View>

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/list-member/wm/[id]",
                  params: { id: memberId },
                })
              }
              className="mt-1 flex-row items-center justify-center rounded-2xl bg-violet-50 py-3.5 dark:bg-violet-950"
            >
              <Text className="font-bold text-[#6F3FA0] dark:text-violet-300">
                Lihat Progres Lengkap
              </Text>
              <Ionicons name="arrow-forward" size={17} color="#6F3FA0" />
            </TouchableOpacity>
          </View>
        ) : null}

        <View className="mb-1 mt-7">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Aktivitas Member
          </Text>
          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Pilih informasi atau tindakan yang dibutuhkan
          </Text>
        </View>

        <View className="mt-4 flex-row flex-wrap justify-between">
          <ActionTile
            icon="barbell-outline"
            title="Workout"
            subtitle="Lihat riwayat workout"
            color="#6F3FA0"
            backgroundColor="#F3E8FF"
            onPress={() =>
              router.push({
                pathname: "/member-history/workout-history",
                params: { id: memberId },
              })
            }
          />
          <ActionTile
            icon="scale-outline"
            title="Weigh & Measure"
            subtitle="Lihat riwayat pengukuran"
            color="#0EA5E9"
            backgroundColor="#E0F2FE"
            onPress={() =>
              router.push({
                pathname: "/member-history/wm-history",
                params: { id: memberId },
              })
            }
          />
          {/* <ActionTile
            icon="add-circle-outline"
            title="Update WM"
            subtitle="Input pengukuran terbaru"
            color="#10B981"
            backgroundColor="#D1FAE5"
            onPress={() =>
              router.push({
                pathname: "/user/input-wm",
                params: { id: memberId },
              })
            }
          /> */}
          <ActionTile
            icon="wallet-outline"
            title="Pembayaran"
            subtitle="Lihat riwayat tagihan"
            color="#6366F1"
            backgroundColor="#E0E7FF"
            onPress={() =>
              router.push({
                pathname: "/member-history/billing-history",
                params: { id: memberId },
              })
            }
          />
          <ActionTile
            icon="trophy-outline"
            title="Challenges"
            subtitle="Lihat progres challenge"
            color="#F59E0B"
            backgroundColor="#FEF3C7"
            onPress={() =>
              router.push({
                pathname: "/list-member/member-challenges",
                params: { id: memberId, name: member.user.name },
              })
            }
          />
        </View>
      </ScrollView>
    </ContainerPage>
  );
}
