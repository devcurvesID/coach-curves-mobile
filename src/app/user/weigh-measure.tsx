import ContainerPage from "@/components/ui/container-page";
import DateMonthPickerModal from "@/components/ui/date-month-picker-modal";
import { LoadingView } from "@/components/ui/loading";
import MenuItem from "@/components/ui/menu-item";
import { useAuth } from "@/context/auth";
import { formatDate } from "@/helpers/dates";
import {
  useLastWeighMeasure,
  useWeighMeasureHistory,
} from "@/hooks/useWeighMeasure";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import type { WeighMeasureRecord } from "@/types/weigh-measure";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

interface SelectedPeriod {
  year: number;
  month: number;
  month_value: string;
}

interface ValueProps {
  label: string;
  value?: number | string | null;
  unit?: string;
}

const getCurrentPeriod = (): SelectedPeriod => {
  const currentDate = new Date();

  return {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    month_value: currentDate.toLocaleString("id-ID", { month: "long" }),
  };
};

const displayValue = (value?: number | string | null, unit = ""): string => {
  if (value === undefined || value === null || value === "") return "-";
  return `${value}${unit}`;
};

const SummaryMetric = ({ label, value, unit }: ValueProps) => (
  <View className="flex-1 rounded-2xl bg-purple-50 px-3 py-4">
    <Text className="text-xs font-medium text-slate-500">{label}</Text>
    <Text className="mt-1 text-xl font-bold text-slate-900">
      {displayValue(value)}
    </Text>
    <Text className="mt-0.5 text-xs text-slate-400">{unit}</Text>
  </View>
);

const DetailRow = ({ label, value, unit = "" }: ValueProps) => (
  <View className="mb-2.5 w-[48%] rounded-xl bg-slate-50 px-3 py-3">
    <Text className="text-xs text-slate-400">{label}</Text>
    <Text className="mt-1 font-bold text-slate-700">
      {displayValue(value, unit)}
    </Text>
  </View>
);

const MeasurementSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View className="mt-5">
    <Text className="mb-2.5 font-bold text-slate-800">{title}</Text>
    <View className="flex-row flex-wrap justify-between">{children}</View>
  </View>
);

const WeighMeasureResult = React.memo(
  ({
    data,
    onDetail,
  }: {
    data: WeighMeasureRecord;
    onDetail: (record: WeighMeasureRecord) => void;
  }) => (
    <View className="mb-5 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <View className="bg-purple-50 px-5 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-purple-600">
              <MaterialCommunityIcons
                name="scale-bathroom"
                size={23}
                color="#FFFFFF"
              />
            </View>
            <View className="ml-3">
              <Text className="text-xs font-semibold uppercase tracking-wide text-purple-500">
                Tanggal WM
              </Text>
              <Text className="mt-0.5 text-base font-bold text-slate-900">
                {formatDate(data.wm_date)}
              </Text>
            </View>
          </View>
          <Ionicons name="checkmark-circle" size={25} color="#16A34A" />
        </View>
      </View>

      <View className="p-5">
        <View className="flex-row gap-2.5">
          <SummaryMetric label="Berat Badan" value={data.weight} unit="kg" />
          <SummaryMetric label="BMI" value={data.bmi} unit="Indeks tubuh" />
          <SummaryMetric
            label="Lemak"
            value={data.body_fat}
            unit="persen (%)"
          />
        </View>

        {/* <View className="mt-3 flex-row items-center rounded-xl bg-emerald-50 px-3 py-2.5">
          <Ionicons name="information-circle" size={18} color="#059669" />
          <Text className="ml-2 flex-1 text-xs font-semibold text-emerald-700">
            Status BMI: {getBmiStatus(data.bmi)}
          </Text>
        </View> */}

        <MeasurementSection title="Informasi Dasar">
          <DetailRow
            label="Umur saat pengukuran"
            value={data.age}
            unit=" tahun"
          />
          <DetailRow label="Tinggi Badan" value={data.height} unit=" cm" />
        </MeasurementSection>

        <MeasurementSection title="Komposisi Tubuh">
          <DetailRow label="Massa Otot" value={data.muscle_mass} unit=" kg" />
          <DetailRow label="Massa Tulang" value={data.bone_mass} unit=" kg" />
          <DetailRow label="Kadar Air" value={data.body_water} unit="%" />
          <DetailRow label="Lemak Visceral" value={data.visceral} />
        </MeasurementSection>

        <MeasurementSection title="Tanda Vital">
          <DetailRow
            label="Tekanan Darah"
            value={
              data.bp_high != null && data.bp_low != null
                ? `${data.bp_high}/${data.bp_low}`
                : null
            }
            unit=" mmHg"
          />
          <DetailRow label="Detak Jantung" value={data.rhr} unit=" bpm" />
        </MeasurementSection>

        <MeasurementSection title="Ukuran Tubuh">
          <DetailRow label="Dada" value={data.chest} unit=" cm" />
          <DetailRow label="Pinggang" value={data.waist} unit=" cm" />
          <DetailRow label="Perut" value={data.abdomen} unit=" cm" />
          <DetailRow label="Pinggul" value={data.hip} unit=" cm" />
          <DetailRow label="Paha" value={data.thigh} unit=" cm" />
          <DetailRow label="Lengan" value={data.arm} unit=" cm" />
        </MeasurementSection>

        <Pressable
          onPress={() => onDetail(data)}
          className="mt-3 flex-row items-center justify-center rounded-2xl bg-purple-600 py-3.5"
        >
          <Ionicons name="document-text-outline" size={19} color="#FFFFFF" />
          <Text className="ml-2 font-bold text-white">Lihat Detail Hasil</Text>
        </Pressable>
      </View>
    </View>
  ),
);

WeighMeasureResult.displayName = "WeighMeasureResult";

export default function WeighMeasureScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: lastWeighMeasure, isLoading } = useLastWeighMeasure();
  const {
    mutate: loadWeighMeasureHistory,
    data: weighMeasureHistory,
    isPending,
    isError,
  } = useWeighMeasureHistory();
  const [selectedPeriod, setSelectedPeriod] =
    useState<SelectedPeriod>(getCurrentPeriod);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const joinedYear = new Date(user.created_at).getFullYear();
  const historyResult = weighMeasureHistory?.response?.[0] as
    WeighMeasureRecord | undefined;
  const resultDate = dayjs(historyResult?.wm_date);
  const measurement =
    historyResult &&
    resultDate.isValid() &&
    resultDate.year() === selectedPeriod.year &&
    resultDate.month() + 1 === selectedPeriod.month
      ? historyResult
      : undefined;

  const loadHistory = useCallback(
    (period: SelectedPeriod) => {
      loadWeighMeasureHistory({ year: period.year, month: period.month - 1 });
    },
    [loadWeighMeasureHistory],
  );

  useEffect(() => {
    loadHistory(selectedPeriod);
  }, [loadHistory, selectedPeriod]);

  const handleSelectPeriod = (period: SelectedPeriod) => {
    setSelectedPeriod(period);
    setIsDatePickerVisible(false);
  };

  const handleDetail = useCallback(
    (record: WeighMeasureRecord) => {
      router.push({
        pathname: "/user/weigh-measure-printout",
        params: { data: JSON.stringify(record) },
      });
    },
    [router],
  );

  if (isLoading) return <LoadingView />;

  return (
    <>
      <ContainerPage titleHeader="Weigh Measure" titleContent={user.name}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-32"
        >
          <View className="flex-row items-center">
            <View className="mr-3 flex-1">
              <MenuItem
                icon="calendar-outline"
                title={`${selectedPeriod.month_value} - ${selectedPeriod.year}`}
                isBottom
                onPress={() => setIsDatePickerVisible(true)}
              />
            </View>
            {lastWeighMeasure && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Lihat grafik progres pengukuran"
                onPress={() => router.push("/user/weigh-measure-progress")}
                className="h-14 w-14 items-center justify-center rounded-2xl bg-purple-600"
              >
                <Ionicons name="stats-chart" size={25} color="#FFFFFF" />
              </Pressable>
            )}
          </View>

          <View className="mb-5 mt-4 flex-row items-center rounded-2xl bg-slate-50 px-4 py-3.5">
            <View className="flex-1">
              <Text className="text-xs text-slate-400">Periode pengukuran</Text>
              <Text className="mt-1 text-lg font-bold text-slate-900">
                {selectedPeriod.month_value} {selectedPeriod.year}
              </Text>
              <Text className="mt-1 text-xs text-slate-500">
                {measurement
                  ? `Tercatat pada ${formatDate(measurement.wm_date)}`
                  : "Belum ada pengukuran pada periode ini"}
              </Text>
            </View>
            {isPending ? (
              <ActivityIndicator color="#6F3FA0" />
            ) : (
              <View
                className={`h-10 w-10 items-center justify-center rounded-full ${
                  measurement ? "bg-emerald-100" : "bg-slate-200"
                }`}
              >
                <Ionicons
                  name={measurement ? "checkmark-circle" : "time-outline"}
                  size={23}
                  color={measurement ? "#059669" : "#64748B"}
                />
              </View>
            )}
          </View>

          {measurement && !isPending && (
            <WeighMeasureResult data={measurement} onDetail={handleDetail} />
          )}

          {!measurement && !isPending && (
            <View className="mt-8 items-center rounded-3xl border border-dashed border-purple-200 bg-purple-50/50 px-6 py-10">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <MaterialCommunityIcons
                  name={isError ? "alert-circle-outline" : "scale-off"}
                  size={30}
                  color="#6F3FA0"
                />
              </View>
              <Text className="mt-4 text-center text-lg font-bold text-slate-800">
                {isError
                  ? "Hasil pengukuran gagal dimuat"
                  : "Belum ada hasil pengukuran"}
              </Text>
              <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
                {isError
                  ? "Periksa koneksi Anda, lalu coba muat kembali."
                  : `Pengukuran untuk ${selectedPeriod.month_value} ${selectedPeriod.year} belum tersedia.`}
              </Text>
              {isError && (
                <Pressable
                  onPress={() => loadHistory(selectedPeriod)}
                  className="mt-5 rounded-xl bg-purple-600 px-5 py-3"
                >
                  <Text className="font-bold text-white">Coba Lagi</Text>
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>
      </ContainerPage>

      <DateMonthPickerModal
        visible={isDatePickerVisible}
        joined_year={joinedYear}
        selectedYear={selectedPeriod.year}
        selectedMonth={selectedPeriod.month}
        onCancel={() => setIsDatePickerVisible(false)}
        onSelect={handleSelectPeriod}
      />
    </>
  );
}
