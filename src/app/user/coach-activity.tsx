import ContainerPage from "@/components/ui/container-page";
import DatePickerModal from "@/components/ui/date-picker-modal";
import { useAuth } from "@/context/auth";
import {
  type CoachActivityReport,
  useCoachActivityReport,
} from "@/hooks/useCoachReport";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

interface ActivityItem {
  key: keyof Omit<CoachActivityReport, "reportDate">;
  label: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  iconBackground: string;
}

const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    key: "memberWeighMeasure",
    label: "Member WM",
    description: "Penimbangan dan pengukuran member",
    icon: "scale-outline",
    iconColor: "#7C3AED",
    iconBackground: "#F3E8FF",
  },
  {
    key: "lockerPayments",
    label: "Pembayaran Loker",
    description: "Transaksi pembayaran loker",
    icon: "key-outline",
    iconColor: "#D97706",
    iconBackground: "#FEF3C7",
  },
  {
    key: "membershipPayments",
    label: "Pembayaran Keanggotaan",
    description: "Pembayaran biaya keanggotaan",
    icon: "card-outline",
    iconColor: "#2563EB",
    iconBackground: "#DBEAFE",
  },
  {
    key: "promoPayments",
    label: "Pembayaran Promo",
    description: "Transaksi melalui program promo",
    icon: "pricetag-outline",
    iconColor: "#DB2777",
    iconBackground: "#FCE7F3",
  },
  {
    key: "conversionPayments",
    label: "Pembayaran Konversi",
    description: "Transaksi konversi keanggotaan",
    icon: "swap-horizontal-outline",
    iconColor: "#0891B2",
    iconBackground: "#CFFAFE",
  },
  {
    key: "membershipRenewals",
    label: "Pembaharuan Keanggotaan",
    description: "Keanggotaan yang diperbaharui",
    icon: "refresh-circle-outline",
    iconColor: "#16A34A",
    iconBackground: "#DCFCE7",
  },
  {
    key: "productPayments",
    label: "Pembayaran Produk",
    description: "Transaksi pembelian produk",
    icon: "bag-handle-outline",
    iconColor: "#EA580C",
    iconBackground: "#FFEDD5",
  },
  {
    key: "membershipExtensions",
    label: "Perpanjangan Keanggotaan",
    description: "Keanggotaan yang diperpanjang",
    icon: "calendar-number-outline",
    iconColor: "#4F46E5",
    iconBackground: "#E0E7FF",
  },
];

const formatApiDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date: Date): string =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

export default function CoachActivityScreen() {
  const { user } = useAuth();
  const today = React.useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = React.useState(today);
  const [isDatePickerVisible, setIsDatePickerVisible] = React.useState(false);
  const reportDate = formatApiDate(selectedDate);
  const { data, isLoading, isFetching, isError, refetch } =
    useCoachActivityReport(reportDate);
  const totalActivities = data
    ? ACTIVITY_ITEMS.reduce((total, item) => total + data[item.key], 0)
    : 0;

  const selectDate = (date: Date): void => {
    setSelectedDate(date);
    setIsDatePickerVisible(false);
  };

  return (
    <>
      <ContainerPage
        titleHeader="Aktivitas Coach"
        titleContent={user?.name || "Ringkasan Harian"}
      >
        <ScrollView
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
        >
          <View className="overflow-hidden rounded-3xl bg-purple-700 p-5">
            <View className="flex-row items-center">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Ionicons name="analytics-outline" size={25} color="#FFFFFF" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs font-semibold uppercase tracking-wider text-purple-200">
                  Report Aktivitas
                </Text>
                <Text className="mt-1 text-lg font-black text-white">
                  Ringkasan aktivitas coach harian
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pilih tanggal aktivitas coach"
              onPress={() => setIsDatePickerVisible(true)}
              className="mt-5 flex-row items-center rounded-2xl bg-white px-4 py-3.5"
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <Ionicons name="calendar-outline" size={20} color="#6F3FA0" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[10px] font-semibold uppercase text-slate-400">
                  Tanggal Report
                </Text>
                <Text className="mt-0.5 font-bold capitalize text-slate-800">
                  {formatDisplayDate(selectedDate)}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#6F3FA0" />
            </Pressable>
          </View>

          {isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#6F3FA0" />
              <Text className="mt-3 text-sm text-slate-500">
                Memuat aktivitas coach...
              </Text>
            </View>
          ) : isError ? (
            <View className="mt-5 items-center rounded-3xl bg-red-50 p-7">
              <Ionicons name="alert-circle-outline" size={34} color="#DC2626" />
              <Text className="mt-3 text-center text-lg font-bold text-red-700">
                Aktivitas gagal dimuat
              </Text>
              <Text className="mt-1 text-center text-sm text-red-600">
                Periksa koneksi, lalu coba kembali.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => void refetch()}
                className="mt-4 rounded-xl bg-red-600 px-5 py-3"
              >
                <Text className="font-bold text-white">Coba Lagi</Text>
              </Pressable>
            </View>
          ) : !data ? (
            <View className="mt-5 items-center rounded-3xl border border-dashed border-purple-200 bg-purple-50 px-6 py-10">
              <Ionicons
                name="document-text-outline"
                size={38}
                color="#8B5CF6"
              />
              <Text className="mt-4 text-center text-lg font-bold text-slate-800">
                Report belum tersedia
              </Text>
              <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
                Belum ada informasi aktivitas pada tanggal yang dipilih.
              </Text>
            </View>
          ) : (
            <View className="mt-5">
              <View className="flex-row items-center rounded-3xl bg-purple-100 p-5">
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-purple-700">
                  <Ionicons name="pulse-outline" size={27} color="#FFFFFF" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                    Total Aktivitas
                  </Text>
                  <Text className="mt-1 text-3xl font-black text-purple-900">
                    {totalActivities.toLocaleString("id-ID")}
                  </Text>
                  <Text className="mt-1 text-xs text-purple-700">
                    {formatDisplayDate(selectedDate)}
                  </Text>
                </View>
              </View>

              <Text className="mt-6 text-xl font-black text-slate-900">
                Rincian Aktivitas
              </Text>
              <Text className="mb-4 mt-1 text-sm text-slate-500">
                Jumlah layanan dan transaksi pada tanggal yang dipilih.
              </Text>

              {ACTIVITY_ITEMS.map((item) => (
                <View
                  key={item.key}
                  className="mb-3 flex-row items-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <View
                    className="h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: item.iconBackground }}
                  >
                    <Ionicons
                      name={item.icon}
                      size={23}
                      color={item.iconColor}
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="font-bold text-slate-900">
                      {item.label}
                    </Text>
                    <Text className="mt-1 text-xs text-slate-500">
                      {item.description}
                    </Text>
                  </View>
                  <View className="min-w-12 items-center rounded-2xl bg-slate-50 px-3 py-2">
                    <Text className="text-xl font-black text-slate-900">
                      {data[item.key].toLocaleString("id-ID")}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </ContainerPage>

      <DatePickerModal
        visible={isDatePickerVisible}
        selectedDate={selectedDate}
        maximumDate={today}
        eyebrow="Tanggal Report"
        title="Pilih Tanggal Aktivitas"
        onSelect={selectDate}
        onCancel={() => setIsDatePickerVisible(false)}
      />
    </>
  );
}
