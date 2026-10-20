import ContainerPage from "@/components/ui/container-page";
import DatePickerModal from "@/components/ui/date-picker-modal";
import { useAuth } from "@/context/auth";
import { useUserClub } from "@/hooks/useClubs";
import { usePerformanceStaffPrintout } from "@/hooks/usePerformanceStaffReport";
import { buildPerformanceStaffReportPdfHtml } from "@/utils/performance-staff-report-pdf";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

type DatePickerTarget = "from" | "to" | null;
type PdfAction = "preview" | "download" | null;

const formatApiDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date: Date): string =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

const createPdfFileName = (
  staffName: string,
  fromDate: string,
  toDate: string,
): string => {
  const safeName = staffName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
  const savedAt = dayjs().format("DD-MM-YYYY_HH-mm-ss");
  return `REPORT-COACH-${safeName || "STAFF"}_${fromDate}_${toDate}_${savedAt}.pdf`;
};

function DateRangeButton({
  label,
  date,
  onPress,
}: {
  label: string;
  date: Date;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${formatDisplayDate(date)}`}
      onPress={onPress}
      className="mb-3 flex-row items-center rounded-2xl border border-purple-100 bg-white p-4 active:bg-purple-50"
    >
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-purple-100">
        <Ionicons name="calendar-outline" size={21} color="#6F3FA0" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </Text>
        <Text className="mt-1 font-bold capitalize text-slate-900">
          {formatDisplayDate(date)}
        </Text>
        <Text className="mt-0.5 text-xs text-purple-600">
          {formatApiDate(date)}
        </Text>
      </View>
      <Ionicons name="chevron-down" size={20} color="#6F3FA0" />
    </Pressable>
  );
}

export default function DailyReportPrintoutScreen() {
  const { user } = useAuth();
  const today = React.useMemo(() => new Date(), []);
  const [fromDate, setFromDate] = React.useState(today);
  const [toDate, setToDate] = React.useState(today);
  const [datePickerTarget, setDatePickerTarget] =
    React.useState<DatePickerTarget>(null);
  const [pdfAction, setPdfAction] = React.useState<PdfAction>(null);
  const userId = user?._id ? String(user._id) : undefined;
  const staffName = user?.name || "Coach";
  const { data: clubs } = useUserClub();
  const clubName = clubs?.[0]?.club_name || "Curves";
  const {
    mutateAsync: loadPrintout,
    data: printout,
    isPending: isLoadingPrintout,
    isError,
    reset: resetPrintout,
  } = usePerformanceStaffPrintout(userId);
  const fromDateValue = formatApiDate(fromDate);
  const toDateValue = formatApiDate(toDate);
  const hasReports = Boolean(printout?.response.length);

  const selectDate = (date: Date): void => {
    if (datePickerTarget === "from") setFromDate(date);
    if (datePickerTarget === "to") setToDate(date);
    setDatePickerTarget(null);
    resetPrintout();
  };

  const fetchPrintout = async (): Promise<void> => {
    try {
      await loadPrintout({ fromDate: fromDateValue, toDate: toDateValue });
    } catch (error) {
      Alert.alert(
        "Report belum berhasil dimuat",
        error instanceof Error
          ? error.message
          : "Periksa koneksi lalu coba kembali.",
      );
    }
  };

  const createPdfHtml = (): string => {
    if (!printout) return "";
    return buildPerformanceStaffReportPdfHtml({
      clubName,
      printout,
      staffName,
    });
  };

  const previewPdf = async (): Promise<void> => {
    if (!printout || pdfAction) return;
    setPdfAction("preview");
    try {
      await Print.printAsync({ html: createPdfHtml() });
    } catch {
      Alert.alert(
        "PDF tidak dapat ditampilkan",
        "Terjadi kendala saat membuat preview report harian.",
      );
    } finally {
      setPdfAction(null);
    }
  };

  const downloadPdf = async (): Promise<void> => {
    if (!printout || pdfAction) return;
    setPdfAction("download");
    try {
      const { uri } = await Print.printToFileAsync({ html: createPdfHtml() });
      const generatedFile = new File(uri);
      const namedFile = new File(
        Paths.cache,
        createPdfFileName(staffName, fromDateValue, toDateValue),
      );
      if (namedFile.exists) namedFile.delete();
      generatedFile.move(namedFile);

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          "PDF berhasil dibuat",
          "Fitur penyimpanan tidak tersedia pada perangkat ini.",
        );
        return;
      }
      await Sharing.shareAsync(namedFile.uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: `Simpan Report Harian ${staffName}`,
      });
    } catch {
      Alert.alert(
        "PDF tidak dapat disimpan",
        "Terjadi kendala saat membuat file report harian.",
      );
    } finally {
      setPdfAction(null);
    }
  };

  const selectedPickerDate = datePickerTarget === "from" ? fromDate : toDate;

  return (
    <>
      <ContainerPage
        titleHeader="Printout Report Harian"
        titleContent="Pilih periode aktivitas coach"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-2 pb-32 pt-4"
        >
          <View className="rounded-3xl bg-purple-700 p-5">
            <View className="flex-row items-center">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Ionicons
                  name="document-text-outline"
                  size={25}
                  color="#FFFFFF"
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs font-bold uppercase tracking-wider text-purple-200">
                  PDF Report Coach
                </Text>
                <Text className="mt-1 text-lg font-black text-white">
                  {staffName}
                </Text>
                <Text className="mt-1 text-xs text-purple-100">{clubName}</Text>
              </View>
            </View>
            <Text className="mt-4 text-sm leading-5 text-purple-100">
              Tentukan rentang tanggal untuk melihat, mencetak, atau menyimpan
              report aktivitas dalam format PDF.
            </Text>
          </View>

          <View className="mt-5 rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <Text className="mb-4 text-lg font-black text-slate-900">
              Periode Report
            </Text>
            <DateRangeButton
              label="Dari Tanggal"
              date={fromDate}
              onPress={() => setDatePickerTarget("from")}
            />
            <DateRangeButton
              label="Sampai Tanggal"
              date={toDate}
              onPress={() => setDatePickerTarget("to")}
            />
            <Pressable
              accessibilityRole="button"
              disabled={isLoadingPrintout || !userId}
              onPress={() => void fetchPrintout()}
              className={`mt-1 flex-row items-center justify-center rounded-2xl bg-purple-700 py-4 ${
                isLoadingPrintout || !userId ? "opacity-50" : ""
              }`}
            >
              {isLoadingPrintout ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="search-outline" size={20} color="#FFFFFF" />
                  <Text className="ml-2 font-bold text-white">
                    Tampilkan Data Report
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {isError ? (
            <View className="mt-5 items-center rounded-3xl bg-red-50 p-7">
              <Ionicons name="alert-circle-outline" size={34} color="#DC2626" />
              <Text className="mt-3 text-center font-bold text-red-700">
                Data report gagal dimuat
              </Text>
              <Text className="mt-1 text-center text-sm text-red-600">
                Periksa periode atau koneksi, lalu coba kembali.
              </Text>
            </View>
          ) : printout && !hasReports ? (
            <View className="mt-5 items-center rounded-3xl border border-dashed border-purple-200 bg-purple-50 px-6 py-10">
              <Ionicons name="documents-outline" size={38} color="#8B5CF6" />
              <Text className="mt-4 text-center text-lg font-bold text-slate-800">
                Report tidak ditemukan
              </Text>
              <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
                Belum ada report harian pada periode yang dipilih.
              </Text>
            </View>
          ) : printout && hasReports ? (
            <View className="mt-5 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
              <View className="flex-row items-center">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600">
                  <Ionicons name="checkmark" size={25} color="#FFFFFF" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-black text-emerald-900">
                    Data report tersedia
                  </Text>
                  <Text className="mt-1 text-sm text-emerald-700">
                    {printout.total.toLocaleString("id-ID")} report ditemukan
                    pada periode ini.
                  </Text>
                </View>
              </View>

              <View className="mt-5 flex-row gap-3">
                <Pressable
                  accessibilityRole="button"
                  disabled={pdfAction !== null}
                  onPress={() => void previewPdf()}
                  className="flex-1 flex-row items-center justify-center rounded-2xl border border-purple-200 bg-white py-3.5"
                >
                  {pdfAction === "preview" ? (
                    <ActivityIndicator color="#6F3FA0" />
                  ) : (
                    <>
                      <Ionicons name="eye-outline" size={19} color="#6F3FA0" />
                      <Text className="ml-2 font-bold text-purple-700">
                        Preview
                      </Text>
                    </>
                  )}
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={pdfAction !== null}
                  onPress={() => void downloadPdf()}
                  className="flex-1 flex-row items-center justify-center rounded-2xl bg-purple-700 py-3.5"
                >
                  {pdfAction === "download" ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons
                        name="download-outline"
                        size={19}
                        color="#FFFFFF"
                      />
                      <Text className="ml-2 font-bold text-white">
                        Download
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </ContainerPage>

      <DatePickerModal
        visible={datePickerTarget !== null}
        selectedDate={selectedPickerDate}
        minimumDate={datePickerTarget === "to" ? fromDate : undefined}
        maximumDate={datePickerTarget === "from" ? toDate : today}
        eyebrow="Periode Report"
        title={
          datePickerTarget === "from"
            ? "Pilih Tanggal Awal"
            : "Pilih Tanggal Akhir"
        }
        onSelect={selectDate}
        onCancel={() => setDatePickerTarget(null)}
      />
    </>
  );
}
