import ContainerPage from "@/components/ui/container-page";
import {
  type PerformanceStaffRenewalActivityRecord,
  usePerformanceStaffRenewalActivity,
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

const formatApiDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (value: string): Date | null => {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
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

const formatPaymentDate = (value?: string | null): string => {
  if (!value) return "Tanggal tidak tersedia";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "Tanggal tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const toNumber = (value: number | string | null | undefined): number => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatCurrency = (value: number | string | null | undefined): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(toNumber(value));

const getMemberName = (item: PerformanceStaffRenewalActivityRecord): string =>
  item.user_id && typeof item.user_id === "object"
    ? item.user_id.name?.trim() || "Member Curves"
    : "Member Curves";

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "M";

function AmountItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View
      className={`mb-2 w-[48.5%] rounded-2xl p-3 ${
        highlight ? "bg-purple-50" : "bg-slate-50"
      }`}
    >
      <Text
        className={`text-[10px] font-semibold uppercase ${
          highlight ? "text-purple-500" : "text-slate-400"
        }`}
      >
        {label}
      </Text>
      <Text
        className={`mt-1 text-sm font-black ${
          highlight ? "text-purple-800" : "text-slate-800"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}

function RenewalCard({
  activity,
}: {
  activity: PerformanceStaffRenewalActivityRecord;
}) {
  const memberName = getMemberName(activity);
  const remainingBill = toNumber(activity.rest_of_bill);
  const isPaid =
    remainingBill <= 0 || activity.payment_status?.toLowerCase() === "paid";

  return (
    <View className="mb-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <View className="flex-row items-center">
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-purple-100">
          <Text className="text-xl font-black text-purple-700">
            {getInitials(memberName)}
          </Text>
        </View>
        <View className="ml-3 flex-1">
          <Text
            className="text-base font-black text-slate-900"
            numberOfLines={2}
          >
            {memberName}
          </Text>
          <Text className="mt-1 text-xs text-slate-500">
            {activity.payment_category || "Renewal Keanggotaan"}
          </Text>
          <View
            className={`mt-2 self-start rounded-full px-2.5 py-1 ${
              isPaid ? "bg-emerald-50" : "bg-amber-50"
            }`}
          >
            <Text
              className={`text-[10px] font-bold uppercase ${
                isPaid ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {isPaid ? "Lunas" : activity.payment_status || "Belum Lunas"}
            </Text>
          </View>
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-full bg-purple-50">
          <Ionicons name="refresh-circle" size={25} color="#6F3FA0" />
        </View>
      </View>

      <View className="mt-4 rounded-2xl bg-slate-50 p-3">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={16} color="#64748B" />
          <Text className="ml-2 flex-1 text-xs text-slate-600">
            {formatPaymentDate(activity.payment_date)}
          </Text>
        </View>
        {activity.payment_number ? (
          <View className="mt-2 flex-row items-start">
            <Ionicons name="receipt-outline" size={16} color="#64748B" />
            <Text className="ml-2 flex-1 text-xs font-semibold text-slate-700">
              {activity.payment_number}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mt-4 flex-row flex-wrap justify-between">
        <AmountItem
          label="Total Tagihan"
          value={formatCurrency(activity.amount_due)}
          highlight
        />
        <AmountItem
          label="Sudah Dibayar"
          value={formatCurrency(activity.amount_paid)}
        />
        <AmountItem label="Diskon" value={formatCurrency(activity.dc_amount)} />
        <AmountItem
          label="Sisa Tagihan"
          value={formatCurrency(activity.rest_of_bill)}
        />
      </View>
    </View>
  );
}

export default function DailyReportRenewalActivityScreen() {
  const params = useLocalSearchParams<{ reportDate?: string }>();
  const today = React.useMemo(() => formatApiDate(new Date()), []);
  const reportDate = /^\d{4}-\d{2}-\d{2}$/.test(params.reportDate ?? "")
    ? params.reportDate!
    : today;
  const { data, isLoading, isFetching, isError, refetch } =
    usePerformanceStaffRenewalActivity(reportDate);
  const renewals = data?.response ?? [];
  const totalRenewals = data?.total ?? renewals.length;

  return (
    <ContainerPage
      titleHeader="Aktivitas Renewal"
      titleContent={formatReportDate(reportDate)}
    >
      <FlatList
        data={renewals}
        keyExtractor={(item, index) => item._id || `renewal-${index}`}
        renderItem={({ item }) => <RenewalCard activity={item} />}
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
                <Ionicons name="refresh-outline" size={25} color="#FFFFFF" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs font-bold uppercase tracking-wider text-purple-200">
                  Renewal oleh Staff
                </Text>
                <Text className="mt-1 text-lg font-black text-white">
                  {formatReportDate(reportDate)}
                </Text>
              </View>
              {!isLoading && !isError ? (
                <View className="min-w-12 items-center rounded-2xl bg-white/15 px-3 py-2">
                  <Text className="text-2xl font-black text-white">
                    {totalRenewals.toLocaleString("id-ID")}
                  </Text>
                  <Text className="text-[9px] font-bold uppercase text-purple-100">
                    Renewal
                  </Text>
                </View>
              ) : null}
            </View>
            <Text className="mt-4 text-sm leading-5 text-purple-100">
              Daftar pembaharuan keanggotaan yang tercatat pada tanggal report
              harian.
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#6F3FA0" />
              <Text className="mt-3 text-sm text-slate-500">
                Memuat aktivitas renewal...
              </Text>
            </View>
          ) : isError ? (
            <View className="items-center rounded-3xl bg-red-50 px-6 py-10">
              <Ionicons name="alert-circle-outline" size={36} color="#DC2626" />
              <Text className="mt-4 text-center text-lg font-bold text-red-700">
                Aktivitas renewal gagal dimuat
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
                <Ionicons name="refresh-outline" size={38} color="#8B5CF6" />
              </View>
              <Text className="mt-5 text-center text-xl font-black text-slate-800">
                Belum ada aktivitas renewal
              </Text>
              <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                Belum ada pembaharuan keanggotaan pada tanggal report ini.
              </Text>
            </View>
          )
        }
      />
    </ContainerPage>
  );
}
