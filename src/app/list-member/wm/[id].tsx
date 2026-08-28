import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import Text from "@/components/ui/text";
import { formatDate } from "@/helpers/dates";
import { useUserClub } from "@/hooks/useClubs";
import { useDetailMemberByUserId } from "@/hooks/useMember";
import { useWeighMeasureProgressByUserId } from "@/hooks/useWeighMeasure";
import { imageProfileURL } from "@/services/image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import moment from "moment";
import React, { useEffect } from "react";
import { Image, ScrollView, View } from "react-native";

interface MemberIdentity {
  photo?: string | null;
  user?: {
    name?: string | null;
  };
}

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "?";

const InfoItem = ({ icon, label, value }: any) => (
  <View className="w-1/2 mb-4">
    <View className="flex-row items-center">
      <Ionicons name={icon} size={18} color="#6F3FA0" />

      <Text className="ml-2 text-gray-500">{label}</Text>
    </View>

    <Text className="font-bold text-gray-800 mt-1">{value}</Text>
  </View>
);

const MeasurementRow = ({ title, previous, current, unit = " cm" }: any) => {
  const prev = Number(previous);
  const curr = Number(current);

  const diff = curr - prev;

  return (
    <View className="py-3 border-b border-gray-200 dark:border-zinc-800">
      <View className="flex-row justify-between items-center">
        <Text className="text-gray-600 dark:text-gray-300">{title}</Text>

        <Text className="font-bold text-gray-900 dark:text-white">
          {current}
          {unit}
        </Text>
      </View>

      <View className="flex-row justify-between mt-1">
        <Text className="text-xs text-gray-400">
          Sebelumnya {previous}
          {unit}
        </Text>

        <Text
          className={`text-xs font-semibold ${
            diff === 0
              ? "text-gray-400"
              : diff > 0
                ? "text-violet-600 dark:text-violet-400"
                : "text-green-500"
          }`}
        >
          {diff === 0
            ? "● Tidak berubah"
            : `${diff > 0 ? "▲" : "▼"} ${
                diff > 0 ? "+" : ""
              }${diff.toFixed(1)}${unit}`}
        </Text>
      </View>
    </View>
  );
};

const ResultCompareWM = ({ current }: any) => {
  const formatNumber = (
    value: string | number | null | undefined,
    decimal: number = 1,
  ): string => {
    const parsedValue = Number(value);

    if (Number.isNaN(parsedValue)) {
      return "0";
    }

    return Math.abs(parsedValue).toFixed(decimal);
  };
  const isReduction = (value: string | number | null | undefined): boolean => {
    return Number(value) < 0;
  };

  return (
    <View className="px-5 py-5">
      <Text className="text-base font-bold text-slate-800">
        Detail Pencapaian
      </Text>

      <View className="mt-4 flex-row gap-3">
        <View className="flex-1 items-center rounded-2xl bg-purple-50 px-2 py-4">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <MaterialCommunityIcons
              name="weight-lifter"
              size={22}
              color="#7C3AED"
            />
          </View>

          <Text className="mt-2 text-lg font-bold text-slate-800">
            {isReduction(current.weigh_diff) ? "-" : "+"}
            {formatNumber(current.weigh_diff)}
          </Text>

          <Text className="text-center text-xs text-slate-500">
            Berat Badan
          </Text>
        </View>

        <View className="flex-1 items-center rounded-2xl bg-purple-50 px-2 py-4">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <MaterialCommunityIcons
              name="tape-measure"
              size={22}
              color="#7C3AED"
            />
          </View>

          <Text className="mt-2 text-lg font-bold text-slate-800">
            {isReduction(current.size_diff) ? "-" : "+"}
            {formatNumber(current.size_diff)}
          </Text>

          <Text className="text-center text-xs text-slate-500">
            Ukuran Tubuh
          </Text>
        </View>

        <View className="flex-1 items-center rounded-2xl bg-purple-50 px-2 py-4">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <MaterialCommunityIcons name="percent" size={22} color="#7C3AED" />
          </View>

          <Text className="mt-2 text-lg font-bold text-slate-800">
            {isReduction(current.body_fat_diff) ? "-" : "+"}
            {formatNumber(current.body_fat_diff)}
          </Text>

          <Text className="text-center text-xs text-slate-500">
            Lemak Tubuh
          </Text>
        </View>
      </View>
    </View>
  );
};

const SummaryRow = ({
  title,
  previous,
  current,
  unit = "",
  reverse = false,
}: any) => {
  const prev = Number(previous);
  const curr = Number(current);

  const diff = curr - prev;

  const good = reverse ? diff > 0 : diff < 0;

  const color =
    diff === 0 ? "text-gray-400" : good ? "text-green-500" : "text-red-500";

  const icon = diff === 0 ? "●" : diff > 0 ? "▲" : "▼";

  return (
    <View className="py-4 border-b border-gray-200 dark:border-zinc-800">
      <View className="flex-row justify-between">
        <Text className="text-gray-600 dark:text-gray-300">{title}</Text>

        <Text className={`font-bold ${color}`}>
          {icon} {diff > 0 ? "+" : ""}
          {diff.toFixed(1)}
          {unit}
        </Text>
      </View>

      <View className="flex-row justify-between mt-2">
        <Text className="text-gray-400 text-sm">
          {previous}
          {unit}
        </Text>

        <Text className="font-semibold text-gray-900 dark:text-white">
          {current}
          {unit}
        </Text>
      </View>
    </View>
  );
};

const BodyRowItem = ({
  label,
  value,
  previous,
  unit = "",
  reverse = false,
}: any) => {
  const currentNumber = Number(value);
  const previousNumber = Number(previous);
  const hasPrevious =
    previous !== undefined && previous !== null && !isNaN(previousNumber);

  const diff = hasPrevious ? currentNumber - previousNumber : 0;

  const positive = diff > 0;
  const negative = diff < 0;

  // reverse=true untuk Massa Otot, Air Tubuh dll
  const good = reverse ? positive : negative;

  return (
    <View className="flex-row justify-between items-center py-3 border-b border-gray-200 dark:border-zinc-800">
      <Text className="text-gray-600 dark:text-gray-300">{label}</Text>

      <View className="items-end">
        <Text className="font-bold text-gray-800 dark:text-white">
          {value}
          {unit}
        </Text>

        {hasPrevious && diff !== 0 && (
          <Text
            className={`text-xs font-semibold mt-1 ${
              good ? "text-green-500" : "text-red-500"
            }`}
          >
            {positive ? "▲" : "▼"} {positive ? "+" : ""}
            {diff.toFixed(1)}
            {unit}
          </Text>
        )}

        {hasPrevious && diff === 0 && (
          <Text className="text-xs text-gray-400 mt-1">● Tidak berubah</Text>
        )}
      </View>
    </View>
  );
};
export default function DetailInformasiWMScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { id } = params;

  const {
    mutate: weighMeasureProgressFn,
    data: weighMeasureProgress,
    isPending: isPendingProgress,
  } = useWeighMeasureProgressByUserId();
  const {
    mutate: loadMemberDetail,
    data: memberDetailData,
    isPending: isPendingMemberDetail,
  } = useDetailMemberByUserId();
  const { data: userClubs, isLoading: isLoadingUserClub } = useUserClub();
  const clubName = userClubs?.[0]?.club_name ?? "Club belum tersedia";

  useEffect(() => {
    if (id) {
      weighMeasureProgressFn(id);
      loadMemberDetail(id);
    }
  }, [id, loadMemberDetail, weighMeasureProgressFn]);

  if (
    isPendingProgress ||
    isPendingMemberDetail ||
    isLoadingUserClub ||
    !weighMeasureProgress ||
    !memberDetailData
  ) {
    return <LoadingView />;
  }

  const { current, previous } = weighMeasureProgress;
  const member = memberDetailData as MemberIdentity;
  const memberName = member.user?.name?.trim() || "Member";

  return (
    <>
      <ContainerPage
        titleHeader="Ringkasan Perubahan"
        titleContent={memberName}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-2 pt-5 pb-32"
          showsVerticalScrollIndicator={false}
        >
          {/* Detail */}
          <View className="bg-white rounded-3xl p-5 shadow">
            <View className="items-center">
              {member.photo ? (
                <Image
                  source={{ uri: imageProfileURL(member.photo) }}
                  className="h-[85px] w-[85px] rounded-full"
                />
              ) : (
                <View className="h-[85px] w-[85px] items-center justify-center rounded-full bg-violet-100">
                  <Text className="text-2xl font-bold text-[#6F3FA0]">
                    {getInitials(memberName)}
                  </Text>
                </View>
              )}

              <Text className="text-2xl font-bold text-gray-800 mt-3">
                {memberName}
              </Text>

              <Text className="text-gray-500">
                {formatDate(current.wm_date)} - {formatDate(previous.wm_date)}
              </Text>

              <Text className="text-[#6F3FA0] font-semibold mt-1">
                {clubName}
              </Text>
            </View>
          </View>

          {/* improvement */}
          <ResultCompareWM current={current} />
          {/* improvement */}

          <View className="flex-row justify-between mt-4">
            <View className="flex-1 bg-[#BB86FC] rounded-2xl p-4 mr-1">
              <Text className="text-white/80 text-xs">Body Fat</Text>

              <Text className="text-white text-2xl font-bold mt-1">
                {current.body_fat}
              </Text>

              <Text className="text-white/80 text-xs">%</Text>
            </View>

            <View className="flex-1 bg-[#6F3FA0] rounded-2xl p-4 mx-1">
              <Text className="text-white/80 text-xs">BMI</Text>

              <Text className="text-white text-2xl font-bold mt-1">
                {current.bmi}
              </Text>

              <Text className="text-white/80 text-xs">Status</Text>
            </View>

            <View className="flex-1 bg-[#8E5CD9] rounded-2xl p-4 ml-1">
              <Text className="text-white/80 text-xs">Berat Badan</Text>

              <Text className="text-white text-2xl font-bold mt-1">
                {current.weight}
              </Text>

              <Text className="text-white/80 text-xs">kg</Text>
            </View>
          </View>

          <View className="bg-white rounded-3xl p-5 shadow mt-4">
            <Text className="text-lg font-bold text-[#6F3FA0] mb-4">
              Informasi Member
            </Text>

            <View className="flex-row flex-wrap">
              <InfoItem
                icon="calendar-outline"
                label="Umur"
                value={`${current.age} Tahun`}
              />

              <InfoItem
                icon="resize-outline"
                label="Tinggi"
                value={` ${current.height} cm`}
              />

              <InfoItem
                icon="heart-outline"
                label="Tekanan Darah"
                value={`${current.bp_high}/${current.bp_low}`}
              />

              <InfoItem
                icon="pulse-outline"
                label="RHR"
                value={`${current.rhr}`}
              />
            </View>
          </View>

          {/* Ringkasan Perubahan */}
          <View className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow mt-4">
            <Text className="text-lg font-bold text-[#6F3FA0] dark:text-violet-400 mb-5">
              Ringkasan Perubahan
            </Text>

            <Text className="text-gray-500 dark:text-gray-400 mb-4">
              Dibanding penimbangan diawal
            </Text>

            <SummaryRow
              title="Berat Tubuh"
              previous={previous.weight}
              current={current.weight}
              unit=" kg"
            />

            <SummaryRow
              title="Total Pengukuran"
              previous={previous.total_measurement}
              current={current.total_measurement}
              unit=" cm"
            />

            <SummaryRow
              title="Lemak Tubuh"
              previous={previous.body_fat}
              current={current.body_fat}
              unit="%"
            />

            <SummaryRow
              title="Air Tubuh"
              previous={previous.body_water}
              current={current.body_water}
              unit="%"
              reverse
            />
          </View>
          {/* Ringkasan Perubahan */}
          {/* Ringkasan Perubahan Komposisi Tubuh */}
          <View className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow mt-4">
            <Text className="text-lg font-bold text-[#6F3FA0] dark:text-violet-400 mb-2">
              Ringkasan Perubahan Komposisi Tubuh
            </Text>

            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Dibandingkan dengan pengukuran sebelumnya
            </Text>

            <SummaryRow
              title="Berat Tubuh"
              previous={previous.weight}
              current={current.weight}
              unit=" kg"
            />

            <SummaryRow
              title="BMI"
              previous={previous.bmi}
              current={current.bmi}
            />

            <SummaryRow
              title="Lemak Tubuh"
              previous={previous.body_fat}
              current={current.body_fat}
              unit="%"
            />

            <SummaryRow
              title="Air Tubuh"
              previous={previous.body_water}
              current={current.body_water}
              unit="%"
              reverse
            />

            <SummaryRow
              title="Massa Otot"
              previous={previous.muscle_mass}
              current={current.muscle_mass}
              unit=" kg"
              reverse
            />

            <SummaryRow
              title="Massa Tulang"
              previous={previous.bone_mass}
              current={current.bone_mass}
              unit=" kg"
              reverse
            />

            <SummaryRow
              title="Lemak Visceral"
              previous={previous.visceral}
              current={current.visceral}
            />

            <SummaryRow
              title="Metabolic Age"
              previous={previous.metabolic}
              current={current.metabolic}
              unit=" Tahun"
            />

            <SummaryRow
              title="DCI"
              previous={previous.dci}
              current={current.dci}
              unit=" kcal"
              reverse
            />
          </View>
          {/* Ringkasan Perubahan Komposisi Tubuh */}
          {/* Ukuran Tubuh */}
          <View className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow mt-4">
            <Text className="text-lg font-bold text-[#6F3FA0] dark:text-violet-400 mb-2">
              Ukuran Tubuh
            </Text>

            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Perbandingan dengan pengukuran sebelumnya
            </Text>

            <MeasurementRow
              title="Dada"
              previous={previous.chest}
              current={current.chest}
            />

            <MeasurementRow
              title="Pinggang"
              previous={previous.waist}
              current={current.waist}
            />

            <MeasurementRow
              title="Perut"
              previous={previous.abdomen}
              current={current.abdomen}
            />

            <MeasurementRow
              title="Pinggul"
              previous={previous.hip}
              current={current.hip}
            />

            <MeasurementRow
              title="Paha"
              previous={previous.thigh}
              current={current.thigh}
            />

            <MeasurementRow
              title="Lengan"
              previous={previous.arm}
              current={current.arm}
            />

            {/* Total */}
            <View className="bg-violet-50 dark:bg-violet-950 rounded-2xl p-4 mt-5">
              <Text className="text-violet-700 dark:text-violet-300 font-semibold">
                Total Ukuran Tubuh
              </Text>

              <Text className="text-3xl font-bold text-violet-700 dark:text-violet-300 mt-1">
                {current.total_measurement} cm
              </Text>

              <Text
                className={`mt-2 font-semibold ${
                  Number(current.total_measurement) ===
                  Number(previous.total_measurement)
                    ? "text-gray-400"
                    : Number(current.total_measurement) >
                        Number(previous.total_measurement)
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-green-500"
                }`}
              >
                {Number(current.total_measurement) ===
                Number(previous.total_measurement)
                  ? "● Tidak berubah"
                  : `${
                      Number(current.total_measurement) >
                      Number(previous.total_measurement)
                        ? "▲"
                        : "▼"
                    } ${
                      Number(current.total_measurement) >
                      Number(previous.total_measurement)
                        ? "+"
                        : ""
                    }${(
                      Number(current.total_measurement) -
                      Number(previous.total_measurement)
                    ).toFixed(1)} cm`}
              </Text>

              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Sebelumnya {previous.total_measurement} cm
              </Text>
            </View>
          </View>
          {/* Ukuran Tubuh */}

          {/* Aktivitas Latihan */}
          <View className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow mt-4">
            <Text className="text-lg font-bold text-[#6F3FA0] dark:text-violet-400 mb-4">
              Aktivitas Latihan
            </Text>

            <BodyRowItem
              label="Latihan / Bulan"
              value={current.total_wo_per_month}
              unit="x"
            />

            <BodyRowItem label="Program Workout" value={current.pro_workout} />

            <BodyRowItem
              label="3x Seminggu"
              value={current.three_times_a_week}
            />
          </View>
          {/* Aktivitas Latihan */}
          {/* Ringkasan Pengukuran */}
          <View className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow mt-4">
            <Text className="text-lg font-bold text-[#6F3FA0] dark:text-violet-400 mb-4">
              Ringkasan Pengukuran
            </Text>

            <BodyRowItem
              label="Tanggal Pengukuran"
              value={moment(current.wm_date).format("DD MMMM YYYY")}
            />

            <BodyRowItem
              label="Total Body Fat"
              value={current.total_body_fat}
              previous={previous.total_body_fat}
              unit="%"
            />

            <BodyRowItem
              label="Total Hydration"
              value={current.total_hydration}
              previous={previous.total_hydration}
              unit="%"
              reverse
            />
          </View>
          {/* Ringkasan Pengukuran */}
        </ScrollView>
      </ContainerPage>
    </>
  );
}
