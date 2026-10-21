import { UserRoleBadge } from "@/components/profile/user-role-badge";
import ContainerPage from "@/components/ui/container-page";
import DatePickerModal from "@/components/ui/date-picker-modal";
import { useAuth } from "@/context/auth";
import {
  type CreatePerformanceStaffReportPayload,
  type PerformanceStaffAutomaticActivityPayload,
  type PerformanceStaffReport,
  useCreatePerformanceStaffReport,
  usePerformanceStaffLockerActivity,
  usePerformanceStaffProductActivity,
  usePerformanceStaffPromoConversionActivity,
  usePerformanceStaffRegularConversionActivity,
  usePerformanceStaffRenewalActivity,
  usePerformanceStaffReport,
  usePerformanceStaffSalesActivity,
  usePerformanceStaffWmActivity,
} from "@/hooks/usePerformanceStaffReport";
import { imageProfileURL } from "@/services/image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type ManualMetricField =
  | "total_calling"
  | "answer"
  | "apo_confirm"
  | "apo_slow_up"
  | "br"
  | "total_leads"
  | "cp"
  | "flayer"
  | "leads_gp"
  | "pcs"
  | "advance"
  | "jumalah_fa"
  | "jumalah_fwo"
  | "vip"
  | "one_week_free"
  | "promo_750k"
  | "another_promo";

type AutomaticField =
  | "wm"
  | "loker"
  | "konversi_promo"
  | "konversi_regular"
  | "renewal"
  | "product"
  | "total_bayar";

type AutomaticDetailRoute =
  | "/user/daily-report-wm"
  | "/user/daily-report-locker"
  | "/user/daily-report-promo-conversion"
  | "/user/daily-report-regular-conversion"
  | "/user/daily-report-renewal"
  | "/user/daily-report-product"
  | "/user/daily-report-sales";

interface MetricItem {
  field: ManualMetricField;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface MetricSection {
  title: string;
  description: string;
  items: MetricItem[];
}

interface AutomaticItem {
  field: AutomaticField;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: AutomaticDetailRoute;
  isCurrency?: boolean;
}

type HistoricalReportForm = Record<ManualMetricField, string> & {
  lead_guespass: string;
};

const METRIC_SECTIONS: MetricSection[] = [
  {
    title: "Calling & Appointment",
    description: "Aktivitas menghubungi lead dan perkembangan janji temu.",
    items: [
      { field: "total_calling", label: "Total Calling", icon: "call-outline" },
      { field: "answer", label: "Telepon Dijawab", icon: "call-sharp" },
      {
        field: "apo_confirm",
        label: "Appointment Confirm",
        icon: "calendar-number-outline",
      },
      {
        field: "apo_slow_up",
        label: "Appointment Show Up",
        icon: "walk-outline",
      },
    ],
  },
  {
    title: "Lead Generation",
    description: "Sumber dan jumlah lead yang berhasil dikumpulkan.",
    items: [
      { field: "br", label: "Business Referral", icon: "people-outline" },
      {
        field: "total_leads",
        label: "Total Leads",
        icon: "person-add-outline",
      },
      { field: "cp", label: "Community Partner", icon: "business-outline" },
      {
        field: "flayer",
        label: "Brosur Dibagikan",
        icon: "document-text-outline",
      },
      { field: "leads_gp", label: "Leads dari Brosur", icon: "reader-outline" },
    ],
  },
  {
    title: "Coaching & Member Service",
    description: "Pendampingan dan layanan yang diberikan kepada member.",
    items: [
      {
        field: "pcs",
        label: "Personal Coaching Session",
        icon: "person-outline",
      },
      { field: "advance", label: "Advance Workout", icon: "barbell-outline" },
      { field: "jumalah_fa", label: "Fitness Analysis", icon: "body-outline" },
      { field: "jumalah_fwo", label: "First Workout", icon: "fitness-outline" },
    ],
  },
  {
    title: "Guest & Promotion",
    description: "Aktivitas program tamu dan promosi.",
    items: [
      { field: "vip", label: "VIP / Fitness Assessment", icon: "star-outline" },
      { field: "one_week_free", label: "One Week Free", icon: "gift-outline" },
      { field: "promo_750k", label: "Promo 750K", icon: "pricetag-outline" },
      {
        field: "another_promo",
        label: "Promo Lainnya",
        icon: "megaphone-outline",
      },
    ],
  },
];

const AUTOMATIC_ITEMS: AutomaticItem[] = [
  {
    field: "wm",
    label: "Weigh & Measure",
    icon: "scale-outline",
    route: "/user/daily-report-wm",
  },
  {
    field: "loker",
    label: "Loker",
    icon: "key-outline",
    route: "/user/daily-report-locker",
  },
  {
    field: "konversi_promo",
    label: "Konversi Promo",
    icon: "pricetag-outline",
    route: "/user/daily-report-promo-conversion",
  },
  {
    field: "konversi_regular",
    label: "Konversi Regular",
    icon: "swap-horizontal-outline",
    route: "/user/daily-report-regular-conversion",
  },
  {
    field: "renewal",
    label: "Renewal",
    icon: "refresh-circle-outline",
    route: "/user/daily-report-renewal",
  },
  {
    field: "product",
    label: "Product",
    icon: "bag-handle-outline",
    route: "/user/daily-report-product",
  },
  {
    field: "total_bayar",
    label: "Sales",
    icon: "cart-outline",
    route: "/user/daily-report-sales",
    isCurrency: true,
  },
];

const MANUAL_METRIC_FIELDS = METRIC_SECTIONS.flatMap((section) =>
  section.items.map((item) => item.field),
);

const createHistoricalReportForm = (): HistoricalReportForm =>
  ({
    ...Object.fromEntries(MANUAL_METRIC_FIELDS.map((field) => [field, "0"])),
    lead_guespass: "",
  }) as HistoricalReportForm;

const formatApiDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const formatDisplayDate = (date: Date): string =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const toNumber = (value: unknown): number => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const calculatePercentage = (value: number, total: number): string => {
  if (total <= 0) return "0%";
  return `${Math.min((value / total) * 100, 100).toFixed(1)}%`;
};

const createEmptyReportPayload = (
  memberClubId: string | number,
  automatic: PerformanceStaffAutomaticActivityPayload,
  form: HistoricalReportForm,
): CreatePerformanceStaffReportPayload =>
  ({
    member_club_id: memberClubId,
    ...Object.fromEntries(
      MANUAL_METRIC_FIELDS.map((field) => [field, toNumber(form[field])]),
    ),
    lead_guespass: form.lead_guespass.trim(),
    ...automatic,
  }) as CreatePerformanceStaffReportPayload;

function ReadonlyMetricSection({
  section,
  report,
}: {
  section: MetricSection;
  report: PerformanceStaffReport;
}) {
  return (
    <View className="mt-5 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <Text className="text-lg font-black text-slate-900">{section.title}</Text>
      <Text className="mt-1 text-xs leading-5 text-slate-500">
        {section.description}
      </Text>
      <View className="mt-4 flex-row flex-wrap justify-between">
        {section.items.map((item) => (
          <View
            key={item.field}
            className="mb-3 w-[48.5%] rounded-2xl bg-slate-50 p-3"
          >
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-purple-100">
              <Ionicons name={item.icon} size={18} color="#6F3FA0" />
            </View>
            <Text className="mt-3 text-2xl font-black text-slate-900">
              {toNumber(report[item.field]).toLocaleString("id-ID")}
            </Text>
            <Text className="mt-1 text-xs font-bold text-slate-600">
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function EditableMetricSection({
  section,
  form,
  onChange,
}: {
  section: MetricSection;
  form: HistoricalReportForm;
  onChange: (field: ManualMetricField, value: string) => void;
}) {
  return (
    <View className="mt-5 rounded-3xl border border-purple-100 bg-white p-4 shadow-sm">
      <View className="flex-row items-start">
        <View className="flex-1">
          <Text className="text-lg font-black text-slate-900">
            {section.title}
          </Text>
          <Text className="mt-1 text-xs leading-5 text-slate-500">
            {section.description}
          </Text>
        </View>
        <View className="rounded-full bg-purple-100 px-2.5 py-1">
          <Text className="text-[10px] font-bold uppercase text-purple-700">
            Isi sekali
          </Text>
        </View>
      </View>

      <View className="mt-4">
        {section.items.map((item) => {
          const changeValue = (difference: number): void => {
            onChange(
              item.field,
              String(Math.max(0, toNumber(form[item.field]) + difference)),
            );
          };

          return (
            <View
              key={item.field}
              className="mb-3 rounded-2xl border border-slate-100 bg-slate-50 p-3"
            >
              <View className="flex-row items-center">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                  <Ionicons name={item.icon} size={19} color="#6F3FA0" />
                </View>
                <Text className="ml-3 flex-1 font-bold text-slate-800">
                  {item.label}
                </Text>
              </View>
              <View className="mt-3 flex-row items-center">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Kurangi ${item.label}`}
                  onPress={() => changeValue(-1)}
                  className="h-11 w-11 items-center justify-center rounded-xl bg-white"
                >
                  <Ionicons name="remove" size={21} color="#6F3FA0" />
                </Pressable>
                <TextInput
                  value={form[item.field]}
                  keyboardType="number-pad"
                  selectTextOnFocus
                  onChangeText={(value) =>
                    onChange(item.field, value.replace(/[^0-9]/g, ""))
                  }
                  className="mx-2 h-11 flex-1 rounded-xl border border-purple-100 bg-white px-3 text-center text-xl font-black text-purple-700"
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Tambah ${item.label}`}
                  onPress={() => changeValue(1)}
                  className="h-11 w-11 items-center justify-center rounded-xl bg-purple-700"
                >
                  <Ionicons name="add" size={21} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function DailyReportHistoryScreen() {
  const { user } = useAuth();
  const today = React.useMemo(() => new Date(), []);
  const maximumDate = React.useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() - 1);
    return date;
  }, [today]);
  const [selectedDate, setSelectedDate] = React.useState(maximumDate);
  const [isDatePickerVisible, setIsDatePickerVisible] = React.useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] =
    React.useState(false);
  const [form, setForm] = React.useState<HistoricalReportForm>(
    createHistoricalReportForm,
  );
  const reportDate = formatApiDate(selectedDate);
  const userPersonal = user?.user_personal;
  const memberClubId = userPersonal?.member_club_id ?? user?.club_id?.[0];

  const reportQuery = usePerformanceStaffReport(reportDate);
  const createReport = useCreatePerformanceStaffReport(reportDate);
  const wm = usePerformanceStaffWmActivity(reportDate);
  const locker = usePerformanceStaffLockerActivity(reportDate);
  const promo = usePerformanceStaffPromoConversionActivity(reportDate);
  const regular = usePerformanceStaffRegularConversionActivity(reportDate);
  const renewal = usePerformanceStaffRenewalActivity(reportDate);
  const product = usePerformanceStaffProductActivity(reportDate);
  const sales = usePerformanceStaffSalesActivity(reportDate);

  const automaticPayload: PerformanceStaffAutomaticActivityPayload = {
    wm: wm.data?.response.length ?? 0,
    loker: locker.data?.response.length ?? 0,
    konversi_promo: promo.data?.response.length ?? 0,
    konversi_regular: regular.data?.response.length ?? 0,
    renewal: renewal.data?.response.length ?? 0,
    product: product.data?.response.length ?? 0,
    sales:
      (locker.data?.response.length ?? 0) +
      (promo.data?.response.length ?? 0) +
      (regular.data?.response.length ?? 0) +
      (renewal.data?.response.length ?? 0) +
      (product.data?.response.length ?? 0),
    total_bayar: sales.data?.total_bayar ?? 0,
  };
  const automaticQueries = [
    wm,
    locker,
    promo,
    regular,
    renewal,
    product,
    sales,
  ];
  const isAutomaticLoading = automaticQueries.some((query) => query.isLoading);
  const isAutomaticError = automaticQueries.some((query) => query.isError);
  const totalCalling = reportQuery.data
    ? toNumber(reportQuery.data.total_calling)
    : toNumber(form.total_calling);
  const answeredCalling = reportQuery.data
    ? toNumber(reportQuery.data.answer)
    : toNumber(form.answer);
  const appointmentShowUp = reportQuery.data
    ? toNumber(reportQuery.data.apo_slow_up)
    : toNumber(form.apo_slow_up);
  const callPercentage =
    reportQuery.data?.persen_call?.trim() ||
    calculatePercentage(answeredCalling, totalCalling);
  const showUpPercentage =
    reportQuery.data?.persen_su?.trim() ||
    calculatePercentage(appointmentShowUp, totalCalling);

  React.useEffect(() => {
    setForm(createHistoricalReportForm());
  }, [reportDate]);

  const updateMetric = (field: ManualMetricField, value: string): void => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openAutomaticDetail = (route: AutomaticDetailRoute): void => {
    router.push({
      pathname: route,
      params: { reportDate },
    });
  };

  const saveHistoricalReport = async (): Promise<void> => {
    if (!memberClubId) {
      Alert.alert("Club belum tersedia", "Data club pengguna belum ditemukan.");
      return;
    }
    if (isAutomaticLoading || isAutomaticError) {
      Alert.alert(
        "Aktivitas belum lengkap",
        isAutomaticLoading
          ? "Tunggu hingga semua Aktivitas Otomatis selesai dimuat."
          : "Sebagian Aktivitas Otomatis gagal dimuat. Coba muat kembali halaman.",
      );
      return;
    }

    try {
      await createReport.mutateAsync(
        createEmptyReportPayload(memberClubId, automaticPayload, form),
      );
      setIsSuccessModalVisible(true);
    } catch (error) {
      Alert.alert(
        "Report belum tersimpan",
        error instanceof Error ? error.message : "Silakan coba kembali.",
      );
    }
  };

  return (
    <>
      <ContainerPage
        titleHeader="Riwayat Report Harian"
        titleContent="Report tanggal sebelumnya"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-2 pb-36 pt-4"
        >
          <View className="rounded-3xl bg-purple-700 p-5">
            <View className="flex-row items-center">
              <Image
                source={{
                  uri: imageProfileURL(user?.name, userPersonal?.photo),
                }}
                className="h-16 w-16 rounded-full border-4 border-white/30"
              />
              <View className="ml-3 flex-1">
                <Text className="text-lg font-black text-white">
                  {user?.name || "Coach"}
                </Text>
                <Text className="mt-1 text-xs text-purple-100">
                  Keytag: {userPersonal?.key_tag_id || "-"}
                </Text>
                <View className="mt-2">
                  <UserRoleBadge role={user?.user_role} variant="light" />
                </View>
              </View>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => setIsDatePickerVisible(true)}
            className="mt-4 flex-row items-center rounded-2xl border border-purple-100 bg-purple-50 p-4 active:bg-purple-100"
          >
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-purple-700">
              <Ionicons name="calendar-outline" size={22} color="#FFFFFF" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-purple-500">
                Tanggal Report
              </Text>
              <Text className="mt-1 font-black capitalize text-slate-900">
                {formatDisplayDate(selectedDate)}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#6F3FA0" />
          </Pressable>

          {reportQuery.isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#6F3FA0" />
              <Text className="mt-3 text-sm text-slate-500">
                Memuat report...
              </Text>
            </View>
          ) : reportQuery.isError ? (
            <View className="mt-5 items-center rounded-3xl bg-red-50 p-7">
              <Ionicons name="alert-circle-outline" size={36} color="#DC2626" />
              <Text className="mt-3 text-center font-bold text-red-700">
                Report gagal dimuat
              </Text>
              <Pressable
                onPress={() => void reportQuery.refetch()}
                className="mt-4 rounded-xl bg-red-600 px-5 py-3"
              >
                <Text className="font-bold text-white">Coba Lagi</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View
                className={`mt-5 flex-row rounded-2xl p-4 ${
                  reportQuery.data ? "bg-emerald-50" : "bg-amber-50"
                }`}
              >
                <Ionicons
                  name={
                    reportQuery.data ? "checkmark-circle" : "information-circle"
                  }
                  size={23}
                  color={reportQuery.data ? "#059669" : "#D97706"}
                />
                <View className="ml-3 flex-1">
                  <Text className="font-bold text-slate-800">
                    {reportQuery.data
                      ? "Report tersedia dan hanya dapat dilihat"
                      : "Report pada tanggal ini belum tersedia"}
                  </Text>
                  <Text className="mt-1 text-xs leading-5 text-slate-600">
                    {reportQuery.data
                      ? "Data riwayat tidak dapat diubah oleh staff."
                      : "Aktivitas otomatis dapat disimpan sebagai report pada tanggal ini."}
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row gap-3">
                <View className="flex-1 rounded-2xl bg-emerald-50 p-4">
                  <View className="flex-row items-center">
                    <Ionicons name="call-outline" size={17} color="#047857" />
                    <Text className="ml-2 text-xs font-semibold text-emerald-700">
                      Persen Call
                    </Text>
                  </View>
                  <Text className="mt-2 text-2xl font-black text-emerald-700">
                    {callPercentage}
                  </Text>
                  <Text className="mt-1 text-[10px] leading-4 text-emerald-600">
                    Answer ÷ total calling
                  </Text>
                </View>
                <View className="flex-1 rounded-2xl bg-amber-50 p-4">
                  <View className="flex-row items-center">
                    <Ionicons name="people-outline" size={17} color="#B45309" />
                    <Text className="ml-2 text-xs font-semibold text-amber-700">
                      Persen Show Up
                    </Text>
                  </View>
                  <Text className="mt-2 text-2xl font-black text-amber-700">
                    {showUpPercentage}
                  </Text>
                  <Text className="mt-1 text-[10px] leading-4 text-amber-600">
                    Show up ÷ total calling
                  </Text>
                </View>
              </View>

              <View className="mt-5 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <View className="flex-row items-center">
                  <View className="h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                    <Ionicons name="sync-outline" size={21} color="#64748B" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-lg font-black text-slate-900">
                      Aktivitas Otomatis
                    </Text>
                    <Text className="mt-1 text-xs text-slate-500">
                      Dihitung berdasarkan aktivitas pada {reportDate}.
                    </Text>
                  </View>
                </View>
                <View className="mt-4 flex-row flex-wrap justify-between">
                  {AUTOMATIC_ITEMS.map((item) => {
                    const value = automaticPayload[item.field];
                    const queryIndex = AUTOMATIC_ITEMS.indexOf(item);
                    const loading = automaticQueries[queryIndex]?.isLoading;

                    return (
                      <Pressable
                        key={item.field}
                        accessibilityRole="button"
                        accessibilityLabel={`Lihat detail ${item.label} tanggal ${reportDate}`}
                        onPress={() => openAutomaticDetail(item.route)}
                        className="mb-3 w-[48.5%] rounded-2xl border border-purple-100 bg-purple-50 p-3 active:bg-purple-100"
                      >
                        <View className="flex-row items-center justify-between">
                          <Ionicons
                            name={item.icon}
                            size={20}
                            color="#6F3FA0"
                          />
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#6F3FA0"
                          />
                        </View>
                        {loading ? (
                          <ActivityIndicator
                            size="small"
                            color="#6F3FA0"
                            style={{ alignSelf: "flex-start", marginTop: 12 }}
                          />
                        ) : (
                          <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            className="mt-3 text-xl font-black text-slate-900"
                          >
                            {item.isCurrency
                              ? formatCurrency(value)
                              : value.toLocaleString("id-ID")}
                          </Text>
                        )}
                        <Text className="mt-1 text-xs font-bold text-slate-600">
                          {item.label}
                        </Text>
                        <View className="mt-2 flex-row items-center border-t border-purple-100 pt-2">
                          <Ionicons
                            name="eye-outline"
                            size={13}
                            color="#6F3FA0"
                          />
                          <Text className="ml-1 text-[10px] font-bold text-purple-700">
                            Lihat detail
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {METRIC_SECTIONS.map((section) =>
                reportQuery.data ? (
                  <ReadonlyMetricSection
                    key={section.title}
                    section={section}
                    report={reportQuery.data}
                  />
                ) : (
                  <EditableMetricSection
                    key={section.title}
                    section={section}
                    form={form}
                    onChange={updateMetric}
                  />
                ),
              )}

              {reportQuery.data ? (
                <View className="mt-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <Text className="text-lg font-black text-slate-900">
                    Guest Pass
                  </Text>
                  <Text className="mt-1 text-xs text-slate-500">
                    Hanya dapat dilihat
                  </Text>
                  <View className="mt-4 min-h-24 rounded-2xl bg-slate-50 p-4">
                    <Text className="leading-6 text-slate-700">
                      {reportQuery.data.lead_guespass?.trim() ||
                        "Tidak ada informasi guest pass."}
                    </Text>
                  </View>
                </View>
              ) : (
                <>
                  <View className="mt-5 rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-lg font-black text-slate-900">
                        Guest Pass
                      </Text>
                      <View className="rounded-full bg-purple-100 px-2.5 py-1">
                        <Text className="text-[10px] font-bold uppercase text-purple-700">
                          Isi sekali
                        </Text>
                      </View>
                    </View>
                    <Text className="mt-1 text-xs leading-5 text-slate-500">
                      Masukkan nama dan nomor telepon dari kartu guest pass.
                    </Text>
                    <TextInput
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      placeholder="Contoh: Siti - 081234567890"
                      placeholderTextColor="#94A3B8"
                      value={form.lead_guespass}
                      onChangeText={(lead_guespass) =>
                        setForm((current) => ({
                          ...current,
                          lead_guespass,
                        }))
                      }
                      className="mt-4 min-h-28 rounded-2xl border border-purple-100 bg-slate-50 px-4 py-3 text-slate-800"
                    />
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    disabled={
                      createReport.isPending ||
                      isAutomaticLoading ||
                      isAutomaticError ||
                      !memberClubId
                    }
                    onPress={() => void saveHistoricalReport()}
                    className={`mt-5 flex-row items-center justify-center rounded-2xl bg-purple-700 py-4 ${
                      createReport.isPending ||
                      isAutomaticLoading ||
                      isAutomaticError ||
                      !memberClubId
                        ? "opacity-50"
                        : "active:bg-purple-800"
                    }`}
                  >
                    {createReport.isPending || isAutomaticLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Ionicons name="save-outline" size={21} color="#FFFFFF" />
                    )}
                    <Text className="ml-2 font-bold text-white">
                      {isAutomaticLoading
                        ? "Memuat Aktivitas Otomatis"
                        : "Simpan Report Tanggal Ini"}
                    </Text>
                  </Pressable>
                </>
              )}
            </>
          )}
        </ScrollView>
      </ContainerPage>

      <DatePickerModal
        visible={isDatePickerVisible}
        selectedDate={selectedDate}
        maximumDate={maximumDate}
        eyebrow="Riwayat Report"
        title="Pilih Tanggal Sebelumnya"
        onCancel={() => setIsDatePickerVisible(false)}
        onSelect={(date) => {
          setSelectedDate(date);
          setIsDatePickerVisible(false);
        }}
      />

      <Modal
        visible={isSuccessModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsSuccessModalVisible(false)}
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
              Report Berhasil Disimpan
            </Text>
            <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
              Aktivitas otomatis pada tanggal yang dipilih sudah tersimpan
              sebagai report harian.
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
                  {formatDisplayDate(selectedDate)}
                </Text>
                <Text className="mt-0.5 text-xs text-purple-600">
                  {reportDate}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tutup informasi report berhasil disimpan"
              onPress={() => setIsSuccessModalVisible(false)}
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
