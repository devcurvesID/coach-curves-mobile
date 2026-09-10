import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import Text from "@/components/ui/text";
import { formatDate } from "@/helpers/dates";
import { useUserClub } from "@/hooks/useClubs";
import { useDetailMemberByUserId } from "@/hooks/useMember";
import { useWeighMeasureProgressByUserId } from "@/hooks/useWeighMeasure";
import { imageProfileURL } from "@/services/image";
import { buildWeighMeasurePdfHtml } from "@/utils/weigh-measure-pdf";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";

interface MemberIdentity {
  photo?: string | null;
  user?: {
    name?: string | null;
  };
}

type MeasurementValue = string | number | null | undefined;

interface WeighMeasureRecord {
  wm_date?: string | null;
  weight?: MeasurementValue;
  body_fat?: MeasurementValue;
  bmi?: MeasurementValue;
  total_measurement?: MeasurementValue;
  [key: string]: unknown;
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
    <View className="py-3 border-b border-gray-200 ">
      <View className="flex-row justify-between items-center">
        <Text className="text-gray-600 ">{title}</Text>

        <Text className="font-bold text-gray-900 ">
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
                ? "text-violet-600 "
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

const parseNumber = (value: MeasurementValue): number | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const formatMeasurement = (value: MeasurementValue, unit: string) => {
  const parsed = parseNumber(value);
  return parsed === undefined ? "—" : `${parsed.toFixed(1)}${unit}`;
};

function ResumeMetric({
  label,
  icon,
  previous,
  current,
  unit,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  previous: MeasurementValue;
  current: MeasurementValue;
  unit: string;
}) {
  const previousNumber = parseNumber(previous);
  const currentNumber = parseNumber(current);
  const difference =
    previousNumber !== undefined && currentNumber !== undefined
      ? currentNumber - previousNumber
      : undefined;
  const isIncrease = difference !== undefined && difference > 0;
  const isDecrease = difference !== undefined && difference < 0;
  const differenceColor = isDecrease
    ? "text-green-600 "
    : isIncrease
      ? "text-orange-600 "
      : "text-gray-500 ";

  return (
    <View className="mb-3 w-[48%] rounded-2xl border border-gray-100 bg-white p-4  ">
      <View className="flex-row items-center">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-violet-50 ">
          <Ionicons name={icon} size={19} color="#6F3FA0" />
        </View>
        <Text
          numberOfLines={2}
          className="ml-2 flex-1 text-xs font-semibold text-gray-600 "
        >
          {label}
        </Text>
      </View>
      <Text className="mt-3 text-xl font-bold text-gray-900 ">
        {formatMeasurement(current, unit)}
      </Text>
      <Text className="mt-1 text-[11px] text-gray-400">
        Sebelumnya {formatMeasurement(previous, unit)}
      </Text>
      <View className="mt-3 flex-row items-center">
        <Ionicons
          name={
            isIncrease
              ? "trending-up-outline"
              : isDecrease
                ? "trending-down-outline"
                : "remove-outline"
          }
          size={16}
          color={isDecrease ? "#16A34A" : isIncrease ? "#EA580C" : "#9CA3AF"}
        />
        <Text className={`ml-1 text-xs font-bold ${differenceColor}`}>
          {difference === undefined
            ? "Belum dapat dibandingkan"
            : difference === 0
              ? "Tidak berubah"
              : `${difference > 0 ? "+" : ""}${difference.toFixed(1)}${unit}`}
        </Text>
      </View>
    </View>
  );
}

function WeighMeasureResume({
  current,
  previous,
}: {
  current: WeighMeasureRecord;
  previous: WeighMeasureRecord;
}) {
  const metrics = [
    {
      label: "Berat Badan",
      icon: "scale-outline" as const,
      previous: previous.weight,
      current: current.weight,
      unit: " kg",
    },
    {
      label: "Lemak Tubuh",
      icon: "water-outline" as const,
      previous: previous.body_fat,
      current: current.body_fat,
      unit: "%",
    },
    {
      label: "Total Ukuran",
      icon: "resize-outline" as const,
      previous: previous.total_measurement,
      current: current.total_measurement,
      unit: " cm",
    },
    {
      label: "BMI",
      icon: "speedometer-outline" as const,
      previous: previous.bmi,
      current: current.bmi,
      unit: "",
    },
  ];

  return (
    <View className="mt-4 rounded-3xl bg-violet-50 p-5 ">
      <View className="flex-row items-start justify-between">
        <View className="mr-3 flex-1">
          <Text className="text-lg font-bold text-gray-900 ">
            Resume Hasil WM
          </Text>
          <Text className="mt-1 text-sm text-gray-500 ">
            Perbandingan dua penimbangan terakhir
          </Text>
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#6F3FA0]">
          <Ionicons name="analytics-outline" size={23} color="white" />
        </View>
      </View>

      <View className="mt-4 flex-row items-center rounded-xl bg-white px-3 py-3 ">
        <Ionicons name="calendar-outline" size={18} color="#6F3FA0" />
        <Text className="ml-2 flex-1 text-xs font-semibold text-violet-700 ">
          {previous.wm_date ? formatDate(previous.wm_date) : "—"} →{" "}
          {current.wm_date ? formatDate(current.wm_date) : "—"}
        </Text>
      </View>

      <View className="mt-4 flex-row flex-wrap justify-between">
        {metrics.map((metric) => (
          <ResumeMetric key={metric.label} {...metric} />
        ))}
      </View>

      <View className="mt-1 flex-row items-start rounded-xl bg-white/70 p-3 ">
        <Ionicons name="information-circle-outline" size={18} color="#6F3FA0" />
        <Text className="ml-2 flex-1 text-xs leading-5 text-gray-500 ">
          Warna hijau menunjukkan nilai menurun, sedangkan oranye menunjukkan
          nilai meningkat dari penimbangan sebelumnya.
        </Text>
      </View>
    </View>
  );
}

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
    <View className="py-4 border-b border-gray-200 ">
      <View className="flex-row justify-between">
        <Text className="text-gray-600 ">{title}</Text>

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

        <Text className="font-semibold text-gray-900 ">
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
    <View className="flex-row justify-between items-center py-3 border-b border-gray-200 ">
      <Text className="text-gray-600 ">{label}</Text>

      <View className="items-end">
        <Text className="font-bold text-gray-800 ">
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
  const [hasPhotoError, setHasPhotoError] = useState(false);
  const [pdfAction, setPdfAction] = useState<"preview" | "download" | null>(
    null,
  );

  const {
    mutate: weighMeasureProgressFn,
    data: weighMeasureProgress,
    isPending: isPendingProgress,
    isError: isProgressError,
  } = useWeighMeasureProgressByUserId();
  const {
    mutate: loadMemberDetail,
    data: memberDetailData,
    isPending: isPendingMemberDetail,
    isError: isMemberDetailError,
  } = useDetailMemberByUserId();
  const { data: userClubs, isLoading: isLoadingUserClub } = useUserClub();
  const clubName = userClubs?.[0]?.club_name ?? "Club belum tersedia";

  useEffect(() => {
    if (id) {
      weighMeasureProgressFn(id);
      loadMemberDetail(id);
    }
  }, [id, loadMemberDetail, weighMeasureProgressFn]);

  if (isPendingProgress || isPendingMemberDetail || isLoadingUserClub) {
    return <LoadingView />;
  }

  const progress = weighMeasureProgress as
    | {
        current?: WeighMeasureRecord | null;
        previous?: WeighMeasureRecord | null;
      }
    | null
    | undefined;
  const current = progress?.current;
  const previous = progress?.previous;
  const member = memberDetailData as MemberIdentity;
  const memberName = member?.user?.name?.trim() || "Member";

  if (
    isProgressError ||
    isMemberDetailError ||
    !memberDetailData ||
    !current ||
    !previous
  ) {
    return (
      <ContainerPage
        titleHeader="Ringkasan Perubahan"
        titleContent="Hasil Weigh & Measure member"
      >
        <View className="flex-1 items-center justify-center px-8 pb-20">
          <View className="rounded-full bg-violet-50 p-5 ">
            <Ionicons
              name={
                isProgressError || isMemberDetailError
                  ? "alert-circle-outline"
                  : "analytics-outline"
              }
              size={42}
              color={
                isProgressError || isMemberDetailError ? "#DC2626" : "#6F3FA0"
              }
            />
          </View>
          <Text className="mt-4 text-center text-lg font-bold text-gray-900 ">
            {isProgressError || isMemberDetailError
              ? "Informasi WM gagal dimuat"
              : "Data perbandingan belum tersedia"}
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-gray-500 ">
            {isProgressError || isMemberDetailError
              ? "Periksa koneksi lalu coba memuat data kembali."
              : "Resume WM dapat ditampilkan setelah member memiliki dua hasil penimbangan."}
          </Text>
          {id && (isProgressError || isMemberDetailError) ? (
            <Pressable
              onPress={() => {
                weighMeasureProgressFn(id);
                loadMemberDetail(id);
              }}
              className="mt-5 rounded-2xl bg-[#6F3FA0] px-6 py-3"
            >
              <Text className="font-bold text-white">Coba Lagi</Text>
            </Pressable>
          ) : null}
        </View>
      </ContainerPage>
    );
  }

  const createPdfHtml = () =>
    buildWeighMeasurePdfHtml({
      memberName,
      clubName,
      photoUrl: member.photo ? imageProfileURL(member.photo) : undefined,
      current,
      previous,
    });

  const previewPdf = async () => {
    if (pdfAction) return;
    setPdfAction("preview");
    try {
      await Print.printAsync({ html: createPdfHtml() });
    } catch {
      Alert.alert(
        "PDF Tidak Dapat Ditampilkan",
        "Terjadi kendala saat membuat preview PDF. Silakan coba kembali.",
      );
    } finally {
      setPdfAction(null);
    }
  };

  const downloadPdf = async () => {
    if (pdfAction) return;
    setPdfAction("download");
    try {
      const { uri } = await Print.printToFileAsync({ html: createPdfHtml() });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          "PDF Berhasil Dibuat",
          "Fitur penyimpanan tidak tersedia pada perangkat ini.",
        );
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: `Simpan Resume WM ${memberName}`,
      });
    } catch {
      Alert.alert(
        "PDF Tidak Dapat Disimpan",
        "Terjadi kendala saat membuat file PDF. Silakan coba kembali.",
      );
    } finally {
      setPdfAction(null);
    }
  };

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
          <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm  ">
            <View className="items-center">
              {member.photo && !hasPhotoError ? (
                <Image
                  source={{ uri: imageProfileURL(member.photo) }}
                  onError={() => setHasPhotoError(true)}
                  className="h-[88px] w-[88px] rounded-3xl bg-violet-50"
                />
              ) : (
                <View className="h-[88px] w-[88px] items-center justify-center rounded-3xl bg-violet-100 ">
                  <Text className="text-2xl font-bold text-[#6F3FA0]">
                    {getInitials(memberName)}
                  </Text>
                </View>
              )}

              <Text className="mt-3 text-2xl font-bold text-gray-800 ">
                {memberName}
              </Text>

              <View className="mt-2 flex-row items-center">
                <Ionicons name="business-outline" size={16} color="#6F3FA0" />
                <Text className="ml-1.5 font-semibold text-[#6F3FA0] ">
                  {clubName}
                </Text>
              </View>
            </View>
          </View>

          <WeighMeasureResume current={current} previous={previous} />

          <View className="mt-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm  ">
            <View className="flex-row items-start">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-red-50 ">
                <Ionicons
                  name="document-text-outline"
                  size={23}
                  color="#DC2626"
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-lg font-bold text-gray-900 ">
                  Resume WM dalam PDF
                </Text>
                <Text className="mt-1 text-xs leading-5 text-gray-500 ">
                  Lihat dokumen terlebih dahulu atau simpan untuk dibagikan
                  kepada member.
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Lihat resume WM dalam PDF"
                disabled={pdfAction !== null}
                onPress={() => void previewPdf()}
                className="flex-1 flex-row items-center justify-center rounded-2xl border border-violet-200 py-3.5 "
              >
                {pdfAction === "preview" ? (
                  <ActivityIndicator size="small" color="#6F3FA0" />
                ) : (
                  <Ionicons name="eye-outline" size={19} color="#6F3FA0" />
                )}
                <Text className="ml-2 font-bold text-[#6F3FA0] ">
                  Lihat PDF
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Simpan resume WM sebagai PDF"
                disabled={pdfAction !== null}
                onPress={() => void downloadPdf()}
                className="flex-1 flex-row items-center justify-center rounded-2xl bg-[#6F3FA0] py-3.5"
              >
                {pdfAction === "download" ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="download-outline" size={19} color="white" />
                )}
                <Text className="ml-2 font-bold text-white">Simpan PDF</Text>
              </Pressable>
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

          {/* Ringkasan Perubahan Komposisi Tubuh */}
          <View className="bg-white  rounded-3xl p-5 shadow mt-4">
            <Text className="text-lg font-bold text-[#6F3FA0]  mb-2">
              Ringkasan Perubahan Komposisi Tubuh
            </Text>

            <Text className="text-sm text-gray-500  mb-4">
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
          <View className="bg-white  rounded-3xl p-5 shadow mt-4">
            <Text className="text-lg font-bold text-[#6F3FA0]  mb-2">
              Ukuran Tubuh
            </Text>

            <Text className="text-sm text-gray-500  mb-4">
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
            <View className="bg-violet-50  rounded-2xl p-4 mt-5">
              <Text className="text-violet-700  font-semibold">
                Total Ukuran Tubuh
              </Text>

              <Text className="text-3xl font-bold text-violet-700  mt-1">
                {current.total_measurement} cm
              </Text>

              <Text
                className={`mt-2 font-semibold ${
                  Number(current.total_measurement) ===
                  Number(previous.total_measurement)
                    ? "text-gray-400"
                    : Number(current.total_measurement) >
                        Number(previous.total_measurement)
                      ? "text-violet-600 "
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

              <Text className="text-xs text-gray-500  mt-1">
                Sebelumnya {previous.total_measurement} cm
              </Text>
            </View>
          </View>
          {/* Ukuran Tubuh */}

          {/* Aktivitas Latihan */}
          <View className="bg-white  rounded-3xl p-5 shadow mt-4">
            <Text className="text-lg font-bold text-[#6F3FA0]  mb-4">
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
          <View className="bg-white  rounded-3xl p-5 shadow mt-4">
            <Text className="text-lg font-bold text-[#6F3FA0]  mb-4">
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
