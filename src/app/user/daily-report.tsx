import { UserRoleBadge } from "@/components/profile/user-role-badge";
import ContainerPage from "@/components/ui/container-page";
import { useAuth } from "@/context/auth";
import {
  type CreatePerformanceStaffReportPayload,
  type PerformanceStaffAutomaticActivityPayload,
  type PerformanceStaffReport,
  type UpdatePerformanceStaffReportPayload,
  useCreatePerformanceStaffReport,
  usePerformanceStaffLockerActivity,
  usePerformanceStaffProductActivity,
  usePerformanceStaffPromoConversionActivity,
  usePerformanceStaffRegularConversionActivity,
  usePerformanceStaffRenewalActivity,
  usePerformanceStaffReport,
  usePerformanceStaffSalesActivity,
  usePerformanceStaffWmActivity,
  useUpdatePerformanceStaffReport,
} from "@/hooks/usePerformanceStaffReport";
import { imageProfileURL } from "@/services/image";
import { Ionicons } from "@expo/vector-icons";
import { type Href, router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type NumericReportField = Exclude<
  keyof PerformanceStaffReport,
  | "member_club_id"
  | "report_date"
  | "lead_guespass"
  | "wm"
  | "loker"
  | "konversi_promo"
  | "konversi_regular"
  | "renewal"
  | "product"
  | "sales"
  | "persen_call"
  | "persen_su"
>;

type ReadonlyReportField =
  | "wm"
  | "loker"
  | "konversi_promo"
  | "konversi_regular"
  | "renewal"
  | "product"
  | "sales";

type ReportSuccessAction = "created" | "updated";

type DailyReportForm = Record<NumericReportField, string> & {
  lead_guespass: string;
};

interface ReportMetric {
  field: NumericReportField;
  label: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}

interface ReportSection {
  title: string;
  description: string;
  metrics: ReportMetric[];
}

interface ReadonlyReportItem {
  field: ReadonlyReportField;
  label: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}

const NUMERIC_FIELDS: NumericReportField[] = [
  "total_calling",
  "answer",
  "apo_confirm",
  "apo_slow_up",
  "br",
  "pcs",
  "advance",
  "cp",
  "flayer",
  "jumalah_fa",
  "jumalah_fwo",
  "vip",
  "one_week_free",
  "promo_750k",
  "another_promo",
  "leads_gp",
  "total_leads",
];

const createInitialReport = (): DailyReportForm =>
  ({
    ...Object.fromEntries(NUMERIC_FIELDS.map((field) => [field, "0"])),
    lead_guespass: "",
  }) as DailyReportForm;

const REPORT_SECTIONS: ReportSection[] = [
  {
    title: "Calling & Appointment",
    description: "Aktivitas menghubungi lead dan perkembangan janji temu.",
    metrics: [
      {
        field: "total_calling",
        label: "Total Calling",
        description: "Jumlah telepon yang dilakukan hari ini",
        icon: "call-outline",
      },
      {
        field: "answer",
        label: "Telepon Dijawab",
        description: "Jumlah lead yang menjawab telepon",
        icon: "call-sharp",
      },
      {
        field: "apo_confirm",
        label: "Appointment Confirm",
        description: "Janji temu yang mengonfirmasi akan hadir",
        icon: "calendar-number-outline",
      },
      {
        field: "apo_slow_up",
        label: "Appointment Show Up",
        description: "Janji temu yang datang ke club",
        icon: "walk-outline",
      },
    ],
  },
  {
    title: "Lead Generation",
    description: "Sumber dan jumlah lead baru yang berhasil dikumpulkan.",
    metrics: [
      {
        field: "br",
        label: "Business Referral",
        description: "Nomor telepon rekomendasi dari member atau lead",
        icon: "people-outline",
      },
      {
        field: "total_leads",
        label: "Total Leads",
        description: "Nama dan nomor telepon yang didapatkan",
        icon: "person-add-outline",
      },
      {
        field: "cp",
        label: "Community Partner",
        description: "Community partner yang didapatkan",
        icon: "business-outline",
      },
      {
        field: "flayer",
        label: "Brosur Dibagikan",
        description: "Jumlah brosur yang dibagikan",
        icon: "document-text-outline",
      },
      {
        field: "leads_gp",
        label: "Leads dari Brosur",
        description: "Lead yang diperoleh dari brosur",
        icon: "reader-outline",
      },
    ],
  },
  {
    title: "Coaching & Member Service",
    description: "Pendampingan dan layanan yang diberikan kepada member.",
    metrics: [
      {
        field: "pcs",
        label: "Personal Coaching Session",
        description: "Member yang mengikuti personal coaching session",
        icon: "person-outline",
      },
      {
        field: "advance",
        label: "Advance Workout",
        description: "Member yang mengikuti advance workout",
        icon: "barbell-outline",
      },
      {
        field: "jumalah_fa",
        label: "Fitness Analysis",
        description: "Analisis kebugaran tubuh yang dilakukan",
        icon: "body-outline",
      },
      {
        field: "jumalah_fwo",
        label: "First Workout",
        description: "Member yang didampingi saat latihan pertama",
        icon: "fitness-outline",
      },
    ],
  },
  {
    title: "Guest & Promotion",
    description: "Aktivitas program tamu dan promosi hari ini.",
    metrics: [
      {
        field: "vip",
        label: "VIP / Fitness Assessment",
        description: "Tamu VIP atau fitness assessment dari HO atau CP",
        icon: "star-outline",
      },
      {
        field: "one_week_free",
        label: "One Week Free",
        description: "Tamu program satu minggu gratis",
        icon: "gift-outline",
      },
      {
        field: "promo_750k",
        label: "Promo 750K",
        description: "Penjualan melalui promo 750K",
        icon: "pricetag-outline",
      },
      {
        field: "another_promo",
        label: "Promo Lainnya",
        description: "Penjualan melalui promo lainnya",
        icon: "megaphone-outline",
      },
    ],
  },
];

const READONLY_REPORT_ITEMS: ReadonlyReportItem[] = [
  {
    field: "wm",
    label: "Weigh & Measure",
    description: "Member yang melakukan penimbangan dan pengukuran",
    icon: "scale-outline",
  },
  {
    field: "loker",
    label: "Loker",
    description: "Jumlah pembayaran loker yang tercatat",
    icon: "key-outline",
  },
  {
    field: "konversi_promo",
    label: "Konversi Promo",
    description: "Konversi keanggotaan melalui promo",
    icon: "pricetag-outline",
  },
  {
    field: "konversi_regular",
    label: "Konversi Regular",
    description: "Konversi keanggotaan regular",
    icon: "swap-horizontal-outline",
  },
  {
    field: "renewal",
    label: "Renewal",
    description: "Pembaharuan keanggotaan yang tercatat",
    icon: "refresh-circle-outline",
  },
  {
    field: "product",
    label: "Product",
    description: "Pembayaran produk yang tercatat",
    icon: "bag-handle-outline",
  },
  {
    field: "sales",
    label: "Sales",
    description: "Total aktivitas penjualan",
    icon: "cart-outline",
  },
];

const formatApiDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatAutomaticActivityValue = (
  field: ReadonlyReportField,
  value: number,
): string =>
  field === "sales"
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(value)
    : value.toLocaleString("id-ID");

const toForm = (report: PerformanceStaffReport): DailyReportForm => {
  const form = createInitialReport();
  NUMERIC_FIELDS.forEach((field) => {
    const value = Number(report[field]);
    form[field] = Number.isFinite(value) ? String(value) : "0";
  });
  form.lead_guespass = report.lead_guespass ?? "";
  return form;
};

const formatPercentage = (value: number, total: number): string => {
  if (total <= 0) return "0%";
  return `${Math.min((value / total) * 100, 100).toFixed(1)}%`;
};

const getUpdatePayload = (
  form: DailyReportForm,
  savedReport: PerformanceStaffReport,
  automaticActivities: PerformanceStaffAutomaticActivityPayload,
): UpdatePerformanceStaffReportPayload => {
  const changedFields: UpdatePerformanceStaffReportPayload = {};

  NUMERIC_FIELDS.forEach((field) => {
    const currentValue = Number(form[field]) || 0;
    const savedValue = Number(savedReport[field]) || 0;
    if (currentValue !== savedValue) changedFields[field] = currentValue;
  });

  const guestPass = form.lead_guespass.trim();
  if (guestPass !== (savedReport.lead_guespass ?? "").trim()) {
    changedFields.lead_guespass = guestPass;
  }

  const savedAutomaticActivities: PerformanceStaffAutomaticActivityPayload = {
    wm: Number(savedReport.wm) || 0,
    loker: Number(savedReport.loker) || 0,
    konversi_promo: Number(savedReport.konversi_promo) || 0,
    konversi_regular: Number(savedReport.konversi_regular) || 0,
    renewal: Number(savedReport.renewal) || 0,
    product: Number(savedReport.product) || 0,
    sales: Number(savedReport.sales) || 0,
    total_bayar: Number(savedReport.total_bayar) || 0,
  };

  (
    Object.keys(
      automaticActivities,
    ) as (keyof PerformanceStaffAutomaticActivityPayload)[]
  ).forEach((field) => {
    if (automaticActivities[field] !== savedAutomaticActivities[field]) {
      changedFields[field] = automaticActivities[field];
    }
  });

  return changedFields;
};

const MetricInput = ({
  metric,
  value,
  onChange,
}: {
  metric: ReportMetric;
  value: string;
  onChange: (value: string) => void;
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const changeValue = (difference: number): void => {
    onChange(String(Math.max(0, (Number(value) || 0) + difference)));
  };

  return (
    <View
      className={`mb-3 rounded-2xl border bg-slate-50 p-4 ${
        isFocused ? "border-purple-400" : "border-slate-100"
      }`}
    >
      <View className="flex-row items-center">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
          <Ionicons name={metric.icon} size={20} color="#6F3FA0" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="font-bold text-slate-800">{metric.label}</Text>
          <Text className="mt-0.5 text-xs leading-4 text-slate-500">
            {metric.description}
          </Text>
        </View>
        <View className="ml-2 flex-row items-center rounded-full bg-purple-100 px-2.5 py-1">
          <Ionicons name="create-outline" size={12} color="#6F3FA0" />
          <Text className="ml-1 text-[10px] font-bold uppercase text-purple-700">
            Dapat diubah
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Kurangi ${metric.label}`}
          onPress={() => changeValue(-1)}
          className="h-12 w-12 items-center justify-center rounded-xl border border-purple-100 bg-white active:bg-purple-50"
        >
          <Ionicons name="remove" size={22} color="#6F3FA0" />
        </Pressable>
        <View className="mx-2 flex-1">
          <TextInput
            accessibilityLabel={`Nilai ${metric.label}, dapat diubah`}
            keyboardType="number-pad"
            selectTextOnFocus
            value={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              if (!value) onChange("0");
            }}
            onChangeText={(nextValue) =>
              onChange(nextValue.replace(/[^0-9]/g, ""))
            }
            className={`h-12 rounded-xl border bg-white px-3 text-center text-xl font-black text-purple-700 ${
              isFocused ? "border-purple-500" : "border-purple-100"
            }`}
          />
          <Text className="mt-1 text-center text-[10px] text-slate-400">
            Ketuk angka untuk mengetik
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Tambah ${metric.label}`}
          onPress={() => changeValue(1)}
          className="h-12 w-12 items-center justify-center rounded-xl bg-purple-700 active:bg-purple-800"
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
};

export default function DailyCoachReportScreen() {
  const { user } = useAuth();
  const [report, setReport] =
    React.useState<DailyReportForm>(createInitialReport);
  const [isGuestPassFocused, setIsGuestPassFocused] = React.useState(false);
  const [successAction, setSuccessAction] =
    React.useState<ReportSuccessAction | null>(null);
  const automaticSyncAttemptRef = React.useRef<string | null>(null);
  const todayDate = React.useMemo(() => new Date(), []);
  const reportDate = formatApiDate(todayDate);
  const userPersonal = user?.user_personal;
  const memberClubId = userPersonal?.member_club_id ?? user?.club_id?.[0];
  const {
    data: savedReport,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = usePerformanceStaffReport(reportDate);
  const { mutateAsync: createReport, isPending: isCreating } =
    useCreatePerformanceStaffReport(reportDate);
  const { mutateAsync: updateReport, isPending: isUpdating } =
    useUpdatePerformanceStaffReport(reportDate);
  const {
    mutateAsync: updateAutomaticReport,
    isPending: isSynchronizingAutomaticActivities,
  } = useUpdatePerformanceStaffReport(reportDate);

  React.useEffect(() => {
    setReport(savedReport ? toForm(savedReport) : createInitialReport());
  }, [savedReport]);

  const totalCalling = Number(report.total_calling) || 0;
  const answer = Number(report.answer) || 0;
  const showUp = Number(report.apo_slow_up) || 0;
  const callPercentage = formatPercentage(answer, totalCalling);
  const showUpPercentage = formatPercentage(showUp, totalCalling);
  const activityReportDate =
    savedReport?.report_date &&
    /^\d{4}-\d{2}-\d{2}/.test(savedReport.report_date)
      ? savedReport.report_date.slice(0, 10)
      : reportDate;
  const activityQueryDate = activityReportDate;
  const wmActivity = usePerformanceStaffWmActivity(activityQueryDate);
  const lockerActivity = usePerformanceStaffLockerActivity(activityQueryDate);
  const promoConversionActivity =
    usePerformanceStaffPromoConversionActivity(activityQueryDate);
  const regularConversionActivity =
    usePerformanceStaffRegularConversionActivity(activityQueryDate);
  const renewalActivity = usePerformanceStaffRenewalActivity(activityQueryDate);
  const productActivity = usePerformanceStaffProductActivity(activityQueryDate);
  const salesActivity = usePerformanceStaffSalesActivity(activityQueryDate);
  const automaticActivityTotals: Record<ReadonlyReportField, number> = {
    wm: wmActivity.data?.response.length ?? 0,
    loker: lockerActivity.data?.response.length ?? 0,
    konversi_promo: promoConversionActivity.data?.response.length ?? 0,
    konversi_regular: regularConversionActivity.data?.response.length ?? 0,
    renewal: renewalActivity.data?.response.length ?? 0,
    product: productActivity.data?.response.length ?? 0,
    sales: salesActivity.data?.total_bayar ?? 0,
  };
  const automaticActivityPayload: PerformanceStaffAutomaticActivityPayload = {
    wm: automaticActivityTotals.wm,
    loker: automaticActivityTotals.loker,
    konversi_promo: automaticActivityTotals.konversi_promo,
    konversi_regular: automaticActivityTotals.konversi_regular,
    renewal: automaticActivityTotals.renewal,
    product: automaticActivityTotals.product,
    sales:
      automaticActivityTotals.loker +
      automaticActivityTotals.konversi_promo +
      automaticActivityTotals.konversi_regular +
      automaticActivityTotals.renewal +
      automaticActivityTotals.product,
    total_bayar: automaticActivityTotals.sales,
  };
  const automaticActivityLoading: Record<ReadonlyReportField, boolean> = {
    wm: wmActivity.isLoading,
    loker: lockerActivity.isLoading,
    konversi_promo: promoConversionActivity.isLoading,
    konversi_regular: regularConversionActivity.isLoading,
    renewal: renewalActivity.isLoading,
    product: productActivity.isLoading,
    sales: salesActivity.isLoading,
  };
  const isAutomaticActivitiesLoading = Object.values(
    automaticActivityLoading,
  ).some(Boolean);
  const isAutomaticActivitiesError = [
    wmActivity,
    lockerActivity,
    promoConversionActivity,
    regularConversionActivity,
    renewalActivity,
    productActivity,
    salesActivity,
  ].some((query) => query.isError);
  const savedSales = Number(savedReport?.sales) || 0;
  const automaticSyncKey = `${reportDate}:${savedSales}:${automaticActivityPayload.wm}:${automaticActivityPayload.loker}:${automaticActivityPayload.konversi_promo}:${automaticActivityPayload.konversi_regular}:${automaticActivityPayload.renewal}:${automaticActivityPayload.product}:${automaticActivityPayload.sales}:${automaticActivityPayload.total_bayar}`;

  React.useEffect(() => {
    if (
      !savedReport ||
      isAutomaticActivitiesLoading ||
      isAutomaticActivitiesError ||
      isSynchronizingAutomaticActivities ||
      savedSales === automaticActivityPayload.sales ||
      automaticSyncAttemptRef.current === automaticSyncKey
    ) {
      return;
    }

    automaticSyncAttemptRef.current = automaticSyncKey;
    void updateAutomaticReport(automaticActivityPayload).catch(() => {
      // Sinkronisasi dapat dicoba kembali saat screen dibuka atau data berubah.
    });
  }, [
    automaticActivityPayload,
    automaticSyncKey,
    isAutomaticActivitiesError,
    isAutomaticActivitiesLoading,
    isSynchronizingAutomaticActivities,
    savedReport,
    savedSales,
    updateAutomaticReport,
  ]);
  const updatePayload = savedReport
    ? getUpdatePayload(report, savedReport, automaticActivityPayload)
    : undefined;
  const hasChanges = Boolean(
    updatePayload && Object.keys(updatePayload).length > 0,
  );
  const isSaving =
    isCreating || isUpdating || isSynchronizingAutomaticActivities;
  const displayDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(todayDate);

  const updateMetric = (field: NumericReportField, value: string): void => {
    setReport((current) => ({ ...current, [field]: value }));
  };

  const submitReport = async (): Promise<void> => {
    Keyboard.dismiss();
    if (!memberClubId) {
      Alert.alert(
        "Club belum tersedia",
        "Data club pengguna belum ditemukan. Silakan masuk ulang dan coba kembali.",
      );
      return;
    }
    if (isAutomaticActivitiesLoading) {
      Alert.alert(
        "Aktivitas masih dimuat",
        "Tunggu hingga seluruh Aktivitas Otomatis selesai dimuat sebelum menyimpan report.",
      );
      return;
    }
    if (isAutomaticActivitiesError) {
      Alert.alert(
        "Aktivitas belum lengkap",
        "Sebagian Aktivitas Otomatis gagal dimuat. Muat ulang halaman sebelum menyimpan report.",
      );
      return;
    }

    try {
      if (savedReport) {
        const changedFields = getUpdatePayload(
          report,
          savedReport,
          automaticActivityPayload,
        );
        if (Object.keys(changedFields).length === 0) {
          Alert.alert(
            "Belum ada perubahan",
            "Ubah minimal satu nilai sebelum menyimpan report.",
          );
          return;
        }
        await updateReport(changedFields);
        setSuccessAction("updated");
      } else {
        const numericPayload = Object.fromEntries(
          NUMERIC_FIELDS.map((field) => [field, Number(report[field]) || 0]),
        ) as Record<NumericReportField, number>;
        const payload: CreatePerformanceStaffReportPayload = {
          member_club_id: memberClubId,
          ...numericPayload,
          ...automaticActivityPayload,
          lead_guespass: report.lead_guespass.trim(),
        };
        await createReport(payload);
        setSuccessAction("created");
      }
    } catch (error) {
      Alert.alert(
        "Report belum tersimpan",
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan. Silakan coba kembali.",
      );
    }
  };

  return (
    <>
      <ContainerPage titleHeader="Report Harian" titleContent="Aktivitas Coach">
        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={24}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-2 pb-36 pt-4"
        >
          <View className="overflow-hidden rounded-3xl bg-purple-700 p-5">
            <View className="flex-row items-center">
              <Image
                source={{
                  uri: imageProfileURL(user?.name, userPersonal?.photo),
                }}
                className="h-20 w-20 rounded-full border-4 border-white/30"
              />
              <View className="ml-4 flex-1">
                <Text className="text-xs font-semibold uppercase tracking-wider text-purple-200">
                  Report Coach
                </Text>
                <Text className="mt-1 text-xl font-black text-white">
                  {user?.name || "Coach"}
                </Text>
                <Text className="mt-1 text-sm text-purple-100">
                  Keytag: {userPersonal?.key_tag_id || "-"}
                </Text>
                <View className="mt-2">
                  <UserRoleBadge role={user?.user_role} variant="light" />
                </View>
              </View>
            </View>
            <View className="mt-5 flex-row items-center rounded-2xl bg-white/10 px-4 py-3">
              <Ionicons name="today-outline" size={19} color="#FFFFFF" />
              <View className="ml-2 flex-1">
                <Text className="capitalize font-semibold text-white">
                  {displayDate}
                </Text>
                <Text className="mt-0.5 text-xs text-purple-200">
                  {reportDate}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Lihat riwayat report harian"
            onPress={() =>
              router.push("/user/daily-report-history" as unknown as Href)
            }
            className="mt-4 flex-row items-center rounded-2xl border border-purple-100 bg-white p-4 active:bg-purple-50"
          >
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-purple-100">
              <Ionicons name="time-outline" size={22} color="#6F3FA0" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-black text-slate-900">
                Riwayat Report Harian
              </Text>
              <Text className="mt-1 text-xs leading-5 text-slate-500">
                Lihat report tanggal sebelumnya atau simpan aktivitas otomatis
                jika report belum tersedia.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color="#6F3FA0" />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Buat PDF report harian"
            onPress={() => router.push("/user/daily-report-printout")}
            className="mt-4 flex-row items-center rounded-2xl border border-purple-100 bg-purple-50 p-4 active:bg-purple-100"
          >
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-purple-700">
              <Ionicons
                name="document-text-outline"
                size={22}
                color="#FFFFFF"
              />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-black text-slate-900">
                Printout Report Harian
              </Text>
              <Text className="mt-1 text-xs leading-5 text-slate-500">
                Pilih periode, preview, dan download report dalam format PDF.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color="#6F3FA0" />
          </Pressable>

          {isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#6F3FA0" />
              <Text className="mt-3 text-sm text-slate-500">
                Memuat report hari ini...
              </Text>
            </View>
          ) : isError ? (
            <View className="mt-5 items-center rounded-3xl bg-red-50 p-7">
              <Ionicons name="alert-circle-outline" size={34} color="#DC2626" />
              <Text className="mt-3 text-center text-lg font-bold text-red-700">
                Report gagal dimuat
              </Text>
              <Text className="mt-1 text-center text-sm text-red-600">
                Periksa koneksi, lalu coba kembali.
              </Text>
              <Pressable
                accessibilityRole="button"
                disabled={isFetching}
                onPress={() => void refetch()}
                className="mt-4 rounded-xl bg-red-600 px-5 py-3"
              >
                {isFetching ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-bold text-white">Coba Lagi</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <>
              <View
                className={`mt-5 flex-row items-start rounded-2xl p-4 ${
                  savedReport ? "bg-emerald-50" : "bg-amber-50"
                }`}
              >
                <Ionicons
                  name={
                    savedReport ? "checkmark-circle" : "document-text-outline"
                  }
                  size={24}
                  color={savedReport ? "#059669" : "#D97706"}
                />
                <View className="ml-3 flex-1">
                  <Text
                    className={`font-bold ${
                      savedReport ? "text-emerald-800" : "text-amber-800"
                    }`}
                  >
                    {savedReport
                      ? "Report hari ini sudah tersedia"
                      : "Report hari ini belum dibuat"}
                  </Text>
                  <Text
                    className={`mt-1 text-xs leading-5 ${
                      savedReport ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    {savedReport
                      ? "Data dari server sudah ditampilkan. Ubah nilai lalu simpan kembali jika diperlukan."
                      : "Lengkapi aktivitas di bawah, kemudian buat report harian hari ini."}
                  </Text>
                </View>
              </View>

              <View className="mt-5 flex-row gap-3">
                <View className="flex-1 rounded-2xl bg-emerald-50 p-4">
                  <Text className="text-xs font-semibold text-emerald-700">
                    Answer Rate
                  </Text>
                  <Text className="mt-1 text-2xl font-black text-emerald-700">
                    {callPercentage}
                  </Text>
                  <Text className="mt-1 text-[11px] text-emerald-600">
                    Answer ÷ total calling
                  </Text>
                </View>
                <View className="flex-1 rounded-2xl bg-amber-50 p-4">
                  <Text className="text-xs font-semibold text-amber-700">
                    Show-up Rate
                  </Text>
                  <Text className="mt-1 text-2xl font-black text-amber-700">
                    {showUpPercentage}
                  </Text>
                  <Text className="mt-1 text-[11px] text-amber-600">
                    Show up ÷ total calling
                  </Text>
                </View>
              </View>

              <View className="mt-5 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <View className="flex-row items-start">
                  <View className="h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                    <Ionicons
                      name="lock-closed-outline"
                      size={21}
                      color="#64748B"
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-lg font-black text-slate-900">
                      Aktivitas Otomatis
                    </Text>
                    <Text className="mt-1 text-xs leading-5 text-slate-500">
                      {savedReport
                        ? "Data berikut dihitung oleh sistem dan tidak dapat diedit dari report harian."
                        : "Data berikut dihitung oleh sistem dan akan disertakan saat report hari ini dibuat."}
                    </Text>
                  </View>
                  <View
                    className={`rounded-full px-2.5 py-1 ${
                      isSynchronizingAutomaticActivities
                        ? "bg-amber-100"
                        : "bg-slate-100"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold uppercase ${
                        isSynchronizingAutomaticActivities
                          ? "text-amber-700"
                          : "text-slate-600"
                      }`}
                    >
                      {isSynchronizingAutomaticActivities
                        ? "Menyinkronkan"
                        : "Hanya dibaca"}
                    </Text>
                  </View>
                </View>

                <View className="mt-4 flex-row flex-wrap justify-between">
                  {READONLY_REPORT_ITEMS.map((item) => {
                    const displayValue = automaticActivityTotals[item.field];
                    const isLoadingActivity =
                      automaticActivityLoading[item.field];
                    const canViewDetails = [
                      "wm",
                      "renewal",
                      "konversi_promo",
                      "konversi_regular",
                      "product",
                      "loker",
                      "sales",
                    ].includes(item.field);
                    const detailLabel =
                      item.field === "wm"
                        ? "member yang melakukan Weigh & Measure"
                        : item.field === "renewal"
                          ? "aktivitas renewal"
                          : item.field === "konversi_promo"
                            ? "aktivitas konversi promo"
                            : item.field === "konversi_regular"
                              ? "aktivitas konversi regular"
                              : item.field === "product"
                                ? "transaksi product"
                                : item.field === "loker"
                                  ? "transaksi loker"
                                  : "ringkasan sales";

                    return (
                      <Pressable
                        key={item.field}
                        accessibilityRole={
                          canViewDetails ? "button" : undefined
                        }
                        accessibilityLabel={
                          canViewDetails
                            ? `Lihat ${displayValue} ${detailLabel}`
                            : undefined
                        }
                        disabled={!canViewDetails}
                        onPress={() => {
                          if (item.field === "wm") {
                            router.push({
                              pathname: "/user/daily-report-wm",
                              params: { reportDate: activityReportDate },
                            });
                            return;
                          }
                          if (item.field === "renewal") {
                            router.push({
                              pathname: "/user/daily-report-renewal",
                              params: { reportDate: activityReportDate },
                            });
                            return;
                          }
                          if (item.field === "konversi_regular") {
                            router.push({
                              pathname: "/user/daily-report-regular-conversion",
                              params: { reportDate: activityReportDate },
                            });
                            return;
                          }
                          if (item.field === "konversi_promo") {
                            router.push({
                              pathname: "/user/daily-report-promo-conversion",
                              params: { reportDate: activityReportDate },
                            });
                            return;
                          }
                          if (item.field === "product") {
                            router.push({
                              pathname: "/user/daily-report-product",
                              params: { reportDate: activityReportDate },
                            });
                            return;
                          }
                          if (item.field === "loker") {
                            router.push({
                              pathname: "/user/daily-report-locker",
                              params: { reportDate: activityReportDate },
                            });
                            return;
                          }
                          if (item.field === "sales") {
                            router.push({
                              pathname: "/user/daily-report-sales",
                              params: { reportDate: activityReportDate },
                            } as unknown as Href);
                          }
                        }}
                        className={`mb-3 w-[48.5%] rounded-2xl p-3 ${
                          canViewDetails
                            ? "border border-purple-200 bg-purple-50 active:bg-purple-100"
                            : "bg-slate-50"
                        }`}
                      >
                        <View className="flex-row items-center">
                          <View className="h-9 w-9 items-center justify-center rounded-xl bg-white">
                            <Ionicons
                              name={item.icon}
                              size={18}
                              color="#6F3FA0"
                            />
                          </View>
                          {canViewDetails ? (
                            <Ionicons
                              name="chevron-forward"
                              size={16}
                              color="#6F3FA0"
                              style={{ marginLeft: "auto" }}
                            />
                          ) : (
                            <Ionicons
                              name="lock-closed"
                              size={11}
                              color="#94A3B8"
                              style={{ marginLeft: "auto" }}
                            />
                          )}
                        </View>
                        {isLoadingActivity ? (
                          <View className="mt-3 h-7 items-start justify-center">
                            <ActivityIndicator size="small" color="#6F3FA0" />
                          </View>
                        ) : (
                          <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            className="mt-3 text-2xl font-black text-slate-900"
                          >
                            {formatAutomaticActivityValue(
                              item.field,
                              displayValue,
                            )}
                          </Text>
                        )}
                        <Text className="mt-1 text-xs font-bold text-slate-700">
                          {item.label}
                        </Text>
                        <Text
                          numberOfLines={2}
                          className="mt-1 text-[10px] leading-4 text-slate-500"
                        >
                          {item.description}
                        </Text>
                        {canViewDetails ? (
                          <View className="mt-2 flex-row items-center border-t border-purple-100 pt-2">
                            <Ionicons
                              name="people-outline"
                              size={13}
                              color="#6F3FA0"
                            />
                            <Text className="ml-1 text-[10px] font-bold text-purple-700">
                              {item.field === "wm"
                                ? "Lihat daftar member"
                                : item.field === "renewal"
                                  ? "Lihat detail renewal"
                                  : [
                                        "konversi_promo",
                                        "konversi_regular",
                                      ].includes(item.field)
                                    ? "Lihat detail konversi"
                                    : item.field === "product"
                                      ? "Lihat transaksi product"
                                      : item.field === "loker"
                                        ? "Lihat transaksi loker"
                                        : "Lihat ringkasan sales"}
                            </Text>
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {REPORT_SECTIONS.map((section) => (
                <View
                  key={section.title}
                  className="mt-5 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <Text className="text-lg font-black text-slate-900">
                    {section.title}
                  </Text>
                  <Text className="mb-4 mt-1 text-xs leading-5 text-slate-500">
                    {section.description}
                  </Text>
                  {section.metrics.map((metric) => (
                    <MetricInput
                      key={metric.field}
                      metric={metric}
                      value={report[metric.field]}
                      onChange={(value) => updateMetric(metric.field, value)}
                    />
                  ))}
                </View>
              ))}

              <View className="mt-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <View className="flex-row items-center">
                  <Text className="flex-1 text-lg font-black text-slate-900">
                    Guest Pass
                  </Text>
                  <View className="flex-row items-center rounded-full bg-purple-100 px-2.5 py-1">
                    <Ionicons name="create-outline" size={12} color="#6F3FA0" />
                    <Text className="ml-1 text-[10px] font-bold uppercase text-purple-700">
                      Dapat diubah
                    </Text>
                  </View>
                </View>
                <Text className="mt-1 text-xs leading-5 text-slate-500">
                  Masukkan nama dan nomor telepon yang diperoleh dari kartu
                  guest pass.
                </Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholder="Contoh: Siti - 081234567890"
                  placeholderTextColor="#94A3B8"
                  value={report.lead_guespass}
                  onFocus={() => setIsGuestPassFocused(true)}
                  onBlur={() => setIsGuestPassFocused(false)}
                  onChangeText={(lead_guespass) =>
                    setReport((current) => ({ ...current, lead_guespass }))
                  }
                  className={`mt-4 min-h-28 rounded-2xl border bg-slate-50 px-4 py-3 text-slate-800 ${
                    isGuestPassFocused
                      ? "border-purple-500"
                      : "border-slate-200"
                  }`}
                />
                <View className="mt-2 flex-row items-center">
                  <Ionicons
                    name="information-circle-outline"
                    size={14}
                    color="#64748B"
                  />
                  <Text className="ml-1.5 text-xs text-slate-500">
                    Ketuk kolom untuk mengubah informasi guest pass.
                  </Text>
                </View>
              </View>

              {!memberClubId ? (
                <View className="mt-5 flex-row rounded-2xl bg-red-50 p-4">
                  <Ionicons
                    name="alert-circle-outline"
                    size={21}
                    color="#DC2626"
                  />
                  <Text className="ml-2 flex-1 text-sm text-red-700">
                    Club pengguna belum tersedia sehingga report belum dapat
                    disimpan.
                  </Text>
                </View>
              ) : null}

              <Pressable
                accessibilityRole="button"
                disabled={
                  isSaving ||
                  isAutomaticActivitiesLoading ||
                  !memberClubId ||
                  (Boolean(savedReport) && !hasChanges)
                }
                onPress={() => void submitReport()}
                className={`mt-6 flex-row items-center justify-center rounded-2xl bg-purple-700 py-4 active:bg-purple-800 ${
                  isSaving ||
                  isAutomaticActivitiesLoading ||
                  !memberClubId ||
                  (Boolean(savedReport) && !hasChanges)
                    ? "opacity-50"
                    : ""
                }`}
              >
                {isSaving || isAutomaticActivitiesLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name={savedReport ? "save-outline" : "add-circle-outline"}
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text className="ml-2 text-base font-bold text-white">
                      {isAutomaticActivitiesLoading
                        ? "Memuat Aktivitas Otomatis"
                        : savedReport
                          ? hasChanges
                            ? "Simpan Perubahan"
                            : "Belum Ada Perubahan"
                          : "Buat Report Hari Ini"}
                    </Text>
                  </>
                )}
              </Pressable>
            </>
          )}
        </KeyboardAwareScrollView>
      </ContainerPage>

      <Modal
        visible={successAction !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSuccessAction(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/45 px-6">
          <View className="w-full max-w-sm items-center rounded-3xl bg-white px-6 pb-6 pt-8 shadow-xl">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-emerald-600">
                <Ionicons name="checkmark" size={34} color="#FFFFFF" />
              </View>
            </View>

            <View className="mt-5 rounded-full bg-emerald-50 px-3 py-1.5">
              <Text className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Berhasil
              </Text>
            </View>
            <Text className="mt-4 text-center text-xl font-black text-slate-900">
              {successAction === "created"
                ? "Report Harian Dibuat"
                : "Report Harian Diperbarui"}
            </Text>
            <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
              {successAction === "created"
                ? "Aktivitas coach hari ini berhasil dibuat dan sudah tersimpan di sistem."
                : "Perubahan aktivitas coach berhasil disimpan ke report hari ini."}
            </Text>

            <View className="mt-5 w-full flex-row items-center rounded-2xl bg-slate-50 p-4">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <Ionicons name="calendar-outline" size={20} color="#6F3FA0" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[10px] font-semibold uppercase text-slate-400">
                  Tanggal Report
                </Text>
                <Text className="mt-0.5 font-bold capitalize text-slate-800">
                  {displayDate}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tutup informasi report berhasil"
              onPress={() => setSuccessAction(null)}
              className="mt-6 w-full items-center rounded-2xl bg-purple-700 py-4 active:bg-purple-800"
            >
              <Text className="text-base font-bold text-white">Selesai</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
