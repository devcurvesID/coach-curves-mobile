import DatePickerModal from "@/components/ui/date-picker-modal";
import ContainerPage from "@/components/ui/container-page";
import { useAuth } from "@/context/auth";
import {
  type StaffPerformancePoint,
  useStaffPerformancePoints,
} from "@/hooks/usePerformanceStaff";
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

const formatApiDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getPointTime = (point: StaffPerformancePoint): string => {
  if (!point.created_at) return "-";
  const normalizedDate = point.created_at.replace(" ", "T");
  const date = new Date(normalizedDate);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function StaffPointsScreen() {
  const { user } = useAuth();
  const today = React.useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = React.useState(today);
  const [isDatePickerVisible, setIsDatePickerVisible] = React.useState(false);
  const userId = user?._id ? String(user._id) : undefined;
  const acquireDate = formatApiDate(selectedDate);
  const { data, isLoading, isFetching, isError, refetch } =
    useStaffPerformancePoints(userId, acquireDate);
  const points = data ?? [];
  const totalPoints = React.useMemo(
    () =>
      points.reduce((total, point) => {
        const amount = Number(point.amount);
        return total + (Number.isFinite(amount) ? amount : 0);
      }, 0),
    [points],
  );

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setIsDatePickerVisible(false);
  };

  return (
    <>
      <ContainerPage titleHeader="Point Staff" titleContent="Performance LSPA">
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
          <View className="rounded-3xl bg-purple-700 p-5">
            <View className="flex-row items-center">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Ionicons name="trophy-outline" size={25} color="#FFFFFF" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs font-semibold uppercase tracking-wider text-purple-200">
                  Point Staff
                </Text>
                <Text className="mt-1 text-lg font-black text-white">
                  {user?.name || "Pengguna"}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pilih tanggal point staff"
              onPress={() => setIsDatePickerVisible(true)}
              className="mt-5 flex-row items-center rounded-2xl bg-white px-4 py-3.5"
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <Ionicons name="calendar-outline" size={20} color="#6F3FA0" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[10px] font-semibold uppercase text-slate-400">
                  Acquire Date
                </Text>
                <Text className="mt-0.5 font-bold capitalize text-slate-800">
                  {new Intl.DateTimeFormat("id-ID", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(selectedDate)}
                </Text>
                <Text className="mt-0.5 text-xs text-purple-600">
                  {acquireDate}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#6F3FA0" />
            </Pressable>
          </View>

          {!userId ? (
            <View className="mt-5 items-center rounded-3xl bg-amber-50 p-6">
              <Ionicons name="alert-circle-outline" size={30} color="#D97706" />
              <Text className="mt-3 text-center font-bold text-amber-800">
                Identitas pengguna belum tersedia
              </Text>
            </View>
          ) : isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#6F3FA0" />
              <Text className="mt-3 text-sm text-slate-500">
                Memuat point staff...
              </Text>
            </View>
          ) : isError ? (
            <View className="mt-5 items-center rounded-3xl bg-red-50 p-6">
              <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
              <Text className="mt-3 text-center font-bold text-red-700">
                Point staff gagal dimuat
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
          ) : points.length === 0 ? (
            <View className="mt-5 items-center rounded-3xl border border-dashed border-purple-200 bg-purple-50/60 px-6 py-10">
              <Ionicons name="stats-chart-outline" size={36} color="#8B5CF6" />
              <Text className="mt-4 text-center text-lg font-bold text-slate-800">
                Point belum tersedia
              </Text>
              <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
                Belum ada data performance staff pada tanggal yang dipilih.
              </Text>
            </View>
          ) : (
            <View className="mt-5">
              <View className="mb-5 flex-row gap-3">
                <View className="flex-1 rounded-2xl bg-purple-100 p-4">
                  <Text className="text-xs font-semibold uppercase text-purple-600">
                    Total Point
                  </Text>
                  <Text className="mt-1 text-3xl font-black text-purple-800">
                    {totalPoints.toLocaleString("id-ID")}
                  </Text>
                </View>
                <View className="flex-1 rounded-2xl bg-emerald-50 p-4">
                  <Text className="text-xs font-semibold uppercase text-emerald-600">
                    Aktivitas
                  </Text>
                  <Text className="mt-1 text-3xl font-black text-emerald-700">
                    {points.length}
                  </Text>
                </View>
              </View>

              <Text className="text-lg font-black text-slate-900">
                Rincian Point
              </Text>
              <Text className="mb-4 mt-1 text-sm text-slate-500">
                Aktivitas performance pada tanggal yang dipilih.
              </Text>

              {points.map((point, index) => (
                <View
                  key={String(point.id ?? `${point.point_id}-${index}`)}
                  className="mb-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <View className="flex-row items-start">
                    <View className="h-12 w-12 items-center justify-center rounded-2xl bg-purple-100">
                      <Ionicons
                        name="sparkles-outline"
                        size={22}
                        color="#6F3FA0"
                      />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-base font-black text-slate-900">
                        {point.point_name || "Aktivitas Point"}
                      </Text>
                      <View className="mt-2 flex-row flex-wrap">
                        {point.point_type ? (
                          <View className="mr-2 rounded-full bg-purple-50 px-2.5 py-1">
                            <Text className="text-[10px] font-bold uppercase text-purple-700">
                              {point.point_type}
                            </Text>
                          </View>
                        ) : null}
                        {point.point_type_detail &&
                        point.point_type_detail !== point.point_type ? (
                          <View className="rounded-full bg-slate-100 px-2.5 py-1">
                            <Text className="text-[10px] font-bold uppercase text-slate-600">
                              {point.point_type_detail}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                    <View className="items-end rounded-2xl bg-emerald-50 px-3 py-2">
                      <Text className="text-[10px] font-semibold uppercase text-emerald-600">
                        Point
                      </Text>
                      <Text className="text-xl font-black text-emerald-700">
                        +{Number(point.amount || 0).toLocaleString("id-ID")}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-4 flex-row items-center border-t border-slate-100 pt-3">
                    <Ionicons name="time-outline" size={16} color="#64748B" />
                    <Text className="ml-1.5 text-xs text-slate-500">
                      Diperoleh pukul {getPointTime(point)}
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
        onSelect={selectDate}
        onCancel={() => setIsDatePickerVisible(false)}
      />
    </>
  );
}
