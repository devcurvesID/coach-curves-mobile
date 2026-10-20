import ContainerPage from "@/components/ui/container-page";
import {
  type PerformanceStaffWmActivityRecord,
  usePerformanceStaffWmActivity,
} from "@/hooks/usePerformanceStaffReport";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

interface WmActivityMember {
  id: string;
  name: string;
  appDate?: string;
  appointmentHour?: string;
  isCompleted: boolean;
}

const formatApiDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (value: string): Date | null => {
  const dateOnly = value.slice(0, 10);
  const [year, month, day] = dateOnly.split("-").map(Number);
  const date = new Date(year, Math.max(0, month - 1), day || 1);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatReportDate = (value: string): string => {
  const date = parseLocalDate(value);
  if (!date) return value;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatAppointmentDate = (value?: string): string => {
  if (!value) return "Tanggal tidak tersedia";
  const date = parseLocalDate(value);
  if (!date) return "Tanggal tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatAppointmentHour = (value?: string): string => {
  if (!value) return "Jam tidak tersedia";
  const match = value.match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]} WIB` : "Jam tidak tersedia";
};

const getCompletedStatus = (
  status: PerformanceStaffWmActivityRecord["status"],
): boolean => {
  if (status === true) return true;
  if (typeof status !== "string") return false;
  return ["true", "completed", "done", "selesai"].includes(
    status.toLowerCase(),
  );
};

const normalizeActivity = (
  item: PerformanceStaffWmActivityRecord,
  index: number,
): WmActivityMember => {
  const user =
    item.user_id && typeof item.user_id === "object" ? item.user_id : undefined;

  return {
    id: item._id || item.id || `wm-activity-${index}`,
    name: user?.name?.trim() || "Member Curves",
    appDate: item.app_date || undefined,
    appointmentHour: item.app_hour || undefined,
    isCompleted: getCompletedStatus(item.status),
  };
};

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "M";

function InformationRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View className="mt-3 flex-row items-center">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-slate-50">
        <Ionicons name={icon} size={17} color="#64748B" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[10px] font-semibold uppercase text-slate-400">
          {label}
        </Text>
        <Text className="mt-0.5 text-sm font-bold text-slate-700">{value}</Text>
      </View>
    </View>
  );
}

function WmActivityCard({ member }: { member: WmActivityMember }) {
  return (
    <View className="mb-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <View className="flex-row items-center">
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-purple-100">
          <Text className="text-xl font-black text-purple-700">
            {getInitials(member.name)}
          </Text>
        </View>
        <View className="ml-3 flex-1">
          <Text
            className="text-base font-black text-slate-900"
            numberOfLines={2}
          >
            {member.name}
          </Text>
          <View
            className={`mt-2 self-start rounded-full px-2.5 py-1 ${
              member.isCompleted ? "bg-emerald-50" : "bg-amber-50"
            }`}
          >
            <Text
              className={`text-[10px] font-bold uppercase ${
                member.isCompleted ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {member.isCompleted ? "WM Selesai" : "Belum Selesai"}
            </Text>
          </View>
        </View>
        <View
          className={`h-11 w-11 items-center justify-center rounded-full ${
            member.isCompleted ? "bg-emerald-50" : "bg-amber-50"
          }`}
        >
          <Ionicons
            name={member.isCompleted ? "checkmark-circle" : "time-outline"}
            size={24}
            color={member.isCompleted ? "#059669" : "#D97706"}
          />
        </View>
      </View>

      <View className="mt-4 border-t border-slate-100 pt-1">
        <InformationRow
          icon="calendar-outline"
          label="Tanggal WM"
          value={formatAppointmentDate(member.appDate)}
        />
        <InformationRow
          icon="time-outline"
          label="Jam WM"
          value={formatAppointmentHour(member.appointmentHour)}
        />
      </View>
    </View>
  );
}

export default function DailyReportWmActivityScreen() {
  const params = useLocalSearchParams<{ reportDate?: string }>();
  const today = React.useMemo(() => formatApiDate(new Date()), []);
  const reportDate = /^\d{4}-\d{2}-\d{2}$/.test(params.reportDate ?? "")
    ? params.reportDate!
    : today;
  const { data, isLoading, isFetching, isError, refetch } =
    usePerformanceStaffWmActivity(reportDate);
  const members = React.useMemo(
    () => (data?.response ?? []).map(normalizeActivity),
    [data?.response],
  );
  const totalMembers = data?.total ?? members.length;

  return (
    <ContainerPage
      titleHeader="Aktivitas Weigh & Measure"
      titleContent={formatReportDate(reportDate)}
    >
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WmActivityCard member={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-2 pb-32 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => void refetch()}
            colors={["#6F3FA0"]}
            tintColor="#6F3FA0"
          />
        }
        ListHeaderComponent={
          <View className="mb-5 rounded-3xl bg-purple-700 p-5">
            <View className="flex-row items-center">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Ionicons name="scale-outline" size={25} color="#FFFFFF" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs font-bold uppercase tracking-wider text-purple-200">
                  WM oleh Staff
                </Text>
                <Text className="mt-1 text-lg font-black text-white">
                  {formatReportDate(reportDate)}
                </Text>
              </View>
              {!isLoading && !isError ? (
                <View className="min-w-12 items-center rounded-2xl bg-white/15 px-3 py-2">
                  <Text className="text-2xl font-black text-white">
                    {totalMembers.toLocaleString("id-ID")}
                  </Text>
                  <Text className="text-[9px] font-bold uppercase text-purple-100">
                    Aktivitas
                  </Text>
                </View>
              ) : null}
            </View>
            <Text className="mt-4 text-sm leading-5 text-purple-100">
              Daftar aktivitas penimbangan dan pengukuran member yang tercatat
              oleh staff pada tanggal report.
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#6F3FA0" />
              <Text className="mt-3 text-sm text-slate-500">
                Memuat aktivitas WM...
              </Text>
            </View>
          ) : isError ? (
            <View className="items-center rounded-3xl bg-red-50 px-6 py-10">
              <Ionicons name="alert-circle-outline" size={36} color="#DC2626" />
              <Text className="mt-4 text-center text-lg font-bold text-red-700">
                Aktivitas WM gagal dimuat
              </Text>
              <Text className="mt-2 text-center text-sm text-red-600">
                Periksa koneksi lalu coba kembali.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => void refetch()}
                className="mt-4 rounded-xl bg-red-600 px-5 py-3"
              >
                <Text className="font-bold text-white">Coba Lagi</Text>
              </Pressable>
            </View>
          ) : (
            <View className="items-center rounded-3xl border border-dashed border-purple-200 bg-purple-50 px-6 py-12">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-white">
                <Ionicons name="scale-outline" size={38} color="#8B5CF6" />
              </View>
              <Text className="mt-5 text-center text-xl font-black text-slate-800">
                Belum ada aktivitas WM
              </Text>
              <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                Belum ada member yang melakukan Weigh & Measure pada tanggal
                ini.
              </Text>
            </View>
          )
        }
      />
    </ContainerPage>
  );
}
