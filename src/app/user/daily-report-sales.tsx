import ContainerPage from "@/components/ui/container-page";
import {
  type PerformanceStaffSalesActivity,
  usePerformanceStaffSalesActivity,
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

type SalesField = Exclude<keyof PerformanceStaffSalesActivity, "total_bayar">;

interface SalesItem {
  field: SalesField;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
}

const SALES_ITEMS: SalesItem[] = [
  {
    field: "konversi_promo",
    label: "Konversi Promo",
    description: "Pembayaran konversi dari program promo",
    icon: "pricetag-outline",
    color: "#DB2777",
    backgroundColor: "#FDF2F8",
  },
  {
    field: "konversi_regular",
    label: "Konversi Regular",
    description: "Pembayaran konversi keanggotaan regular",
    icon: "swap-horizontal-outline",
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  {
    field: "renewal",
    label: "Renewal",
    description: "Pembayaran pembaruan keanggotaan",
    icon: "refresh-circle-outline",
    color: "#059669",
    backgroundColor: "#ECFDF5",
  },
  {
    field: "locker",
    label: "Loker",
    description: "Pembayaran penyewaan loker member",
    icon: "key-outline",
    color: "#D97706",
    backgroundColor: "#FFFBEB",
  },
  {
    field: "product",
    label: "Produk",
    description: "Pembayaran penjualan produk",
    icon: "bag-handle-outline",
    color: "#7C3AED",
    backgroundColor: "#F5F3FF",
  },
];

const formatApiDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const formatReportDate = (value: string): string => {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  const date = new Date(year, Math.max(0, month - 1), day || 1);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

function EmptyState() {
  return (
    <View className="items-center rounded-3xl border border-dashed border-purple-200 bg-purple-50 px-6 py-12">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-white">
        <Ionicons name="stats-chart-outline" size={38} color="#6F3FA0" />
      </View>
      <Text className="mt-5 text-center text-xl font-black text-slate-800">
        Belum ada data sales
      </Text>
      <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
        Ringkasan pembayaran belum tersedia pada tanggal report ini.
      </Text>
    </View>
  );
}

export default function DailyReportSalesActivityScreen() {
  const params = useLocalSearchParams<{ reportDate?: string }>();
  const today = React.useMemo(() => formatApiDate(new Date()), []);
  const reportDate = /^\d{4}-\d{2}-\d{2}$/.test(params.reportDate ?? "")
    ? params.reportDate!
    : today;
  const { data, isLoading, isFetching, isError, refetch } =
    usePerformanceStaffSalesActivity(reportDate);

  return (
    <ContainerPage
      titleHeader="Ringkasan Sales"
      titleContent={formatReportDate(reportDate)}
    >
      <FlatList
        data={data ? SALES_ITEMS : []}
        keyExtractor={(item) => item.field}
        renderItem={({ item, index }) => (
          <View
            className={`flex-row items-center bg-white px-4 py-4 ${
              index === 0 ? "rounded-t-3xl" : ""
            } ${
              index < SALES_ITEMS.length - 1
                ? "border-b border-slate-100"
                : "rounded-b-3xl"
            }`}
          >
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: item.backgroundColor }}
            >
              <Ionicons name={item.icon} size={23} color={item.color} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-bold text-slate-900">{item.label}</Text>
              <Text className="mt-1 text-[11px] leading-4 text-slate-500">
                {item.description}
              </Text>
            </View>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              className="ml-2 max-w-[42%] text-right text-sm font-black text-slate-800"
            >
              {formatCurrency(data?.[item.field] ?? 0)}
            </Text>
          </View>
        )}
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
          <View className="mb-5 overflow-hidden rounded-3xl bg-purple-700 p-5">
            <View className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
            <View className="flex-row items-center">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Ionicons name="wallet-outline" size={25} color="#FFFFFF" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs font-bold uppercase tracking-wider text-purple-200">
                  Pendapatan Staff
                </Text>
                <Text className="mt-1 text-lg font-black text-white">
                  {formatReportDate(reportDate)}
                </Text>
              </View>
            </View>
            {data ? (
              <View className="mt-5 rounded-2xl bg-white/15 p-4">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-purple-100">
                  Total Pembayaran
                </Text>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className="mt-1 text-3xl font-black text-white"
                >
                  {formatCurrency(data.total_bayar)}
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#6F3FA0" />
              <Text className="mt-3 text-sm text-slate-500">
                Memuat ringkasan sales...
              </Text>
            </View>
          ) : isError ? (
            <View className="items-center rounded-3xl bg-red-50 px-6 py-10">
              <Ionicons name="alert-circle-outline" size={36} color="#DC2626" />
              <Text className="mt-4 text-center text-lg font-bold text-red-700">
                Ringkasan sales gagal dimuat
              </Text>
              <Text className="mt-2 text-center text-sm leading-5 text-red-500">
                Periksa koneksi dan coba muat kembali data.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => void refetch()}
                className="mt-4 rounded-xl bg-red-600 px-5 py-3 active:bg-red-700"
              >
                <Text className="font-bold text-white">Coba Lagi</Text>
              </Pressable>
            </View>
          ) : !data ? (
            <EmptyState />
          ) : null
        }
        ListFooterComponent={
          data ? (
            <View className="mt-2 flex-row items-center rounded-2xl bg-emerald-50 p-4">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <Ionicons name="checkmark-circle" size={23} color="#059669" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs font-semibold text-emerald-700">
                  Total seluruh pembayaran
                </Text>
                <Text className="mt-1 text-xl font-black text-emerald-800">
                  {formatCurrency(data.total_bayar)}
                </Text>
              </View>
            </View>
          ) : null
        }
      />
    </ContainerPage>
  );
}
