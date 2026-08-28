import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import { useDetailMemberByUserId } from "@/hooks/useMember";
import { useWeighMeasureHistoryByUserId } from "@/hooks/useWeighMeasure";
import { imageProfileURL } from "@/services/image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

type MeasurementValue = string | number | null;
type HistoryFilter = "current-year" | "all";

interface WMRecord {
  _id: string;
  wm_date: string;
  weight?: MeasurementValue;
  body_fat?: MeasurementValue;
  bmi?: MeasurementValue;
  total_measurement?: MeasurementValue;
}

interface MemberDetail {
  user_id: string;
  user: {
    name: string;
    email?: string | null;
  };
  photo?: string | null;
  key_tag_id?: string | null;
}

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const isValidDate = (value: string): boolean =>
  !Number.isNaN(new Date(value).getTime());

const isCurrentYear = (value: string): boolean =>
  isValidDate(value) &&
  new Date(value).getFullYear() === new Date().getFullYear();

const formatWMDate = (value: string): string => {
  if (!isValidDate(value)) return "Tanggal tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

const formatWMTime = (value: string): string => {
  if (!isValidDate(value)) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
};

const formatMeasurement = (
  value: MeasurementValue | undefined,
  unit = "",
): string => {
  if (value === null || value === undefined || value === "") return "-";
  return `${value}${unit}`;
};

const getDifference = (
  current?: MeasurementValue,
  previous?: MeasurementValue,
): number | null => {
  if (
    current === null ||
    current === undefined ||
    current === "" ||
    previous === null ||
    previous === undefined ||
    previous === ""
  ) {
    return null;
  }
  const currentNumber = Number(current);
  const previousNumber = Number(previous);
  if (!Number.isFinite(currentNumber) || !Number.isFinite(previousNumber)) {
    return null;
  }
  return currentNumber - previousNumber;
};

function StatCard({
  icon,
  label,
  value,
  color,
  backgroundColor,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  color: string;
  backgroundColor: string;
}) {
  return (
    <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor }}
      >
        <Ionicons name={icon} size={21} color={color} />
      </View>
      <Text
        numberOfLines={1}
        className="mt-3 text-xl font-bold text-gray-900 dark:text-white"
      >
        {value}
      </Text>
      <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {label}
      </Text>
    </View>
  );
}

function MeasurementItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}) {
  return (
    <View className="flex-1 items-center rounded-2xl bg-gray-50 px-2 py-3 dark:bg-zinc-800">
      <Ionicons name={icon} size={18} color="#6F3FA0" />
      <Text className="mt-2 font-bold text-gray-900 dark:text-white">
        {value}
      </Text>
      <Text className="mt-1 text-center text-[10px] text-gray-500 dark:text-gray-400">
        {label}
      </Text>
    </View>
  );
}

function WMHistoryCard({
  record,
  sequence,
}: {
  record: WMRecord;
  sequence: number;
}) {
  return (
    <View className="mx-5 mb-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <View className="flex-row items-start">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950">
          <MaterialCommunityIcons
            name="scale-bathroom"
            size={25}
            color="#0EA5E9"
          />
        </View>
        <View className="ml-3 flex-1">
          <View className="flex-row items-start justify-between">
            <View className="mr-2 flex-1">
              <Text className="font-bold text-gray-900 dark:text-white">
                Weigh & Measure
              </Text>
              <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formatWMDate(record.wm_date)}
              </Text>
            </View>
            <View className="rounded-full bg-sky-50 px-2.5 py-1 dark:bg-sky-950">
              <Text className="text-[10px] font-bold text-sky-600 dark:text-sky-300">
                #{sequence}
              </Text>
            </View>
          </View>
          <View className="mt-2 flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#6F3FA0" />
            <Text className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
              {formatWMTime(record.wm_date)} WIB
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4 flex-row gap-2">
        <MeasurementItem
          icon="scale-outline"
          label="Berat"
          value={formatMeasurement(record.weight, " kg")}
        />
        <MeasurementItem
          icon="water-outline"
          label="Body Fat"
          value={formatMeasurement(record.body_fat, "%")}
        />
        <MeasurementItem
          icon="speedometer-outline"
          label="BMI"
          value={formatMeasurement(record.bmi)}
        />
      </View>

      {record.total_measurement !== null &&
        record.total_measurement !== undefined && (
          <View className="mt-3 flex-row items-center rounded-xl bg-violet-50 px-3 py-2.5 dark:bg-violet-950">
            <MaterialCommunityIcons
              name="tape-measure"
              size={18}
              color="#6F3FA0"
            />
            <Text className="ml-2 flex-1 text-xs text-gray-600 dark:text-gray-300">
              Total ukuran tubuh
            </Text>
            <Text className="font-bold text-[#6F3FA0] dark:text-violet-300">
              {formatMeasurement(record.total_measurement, " cm")}
            </Text>
          </View>
        )}
    </View>
  );
}

export default function WMHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [filter, setFilter] = useState<HistoryFilter>("current-year");
  console.log("ididididid", id);

  const {
    mutate: loadMemberDetail,
    data: memberData,
    isPending: isLoadingMember,
    isError: isMemberError,
  } = useDetailMemberByUserId();
  const {
    mutate: loadWMHistory,
    data: historyData,
    isPending: isLoadingHistory,
    isError: isHistoryError,
  } = useWeighMeasureHistoryByUserId();

  useEffect(() => {
    if (!id) return;
    loadMemberDetail(id);
    loadWMHistory(id);
  }, [id, loadMemberDetail, loadWMHistory]);

  const member = memberData as MemberDetail | undefined;
  const records = useMemo(() => {
    const history = (historyData ?? []) as WMRecord[];
    return [...history].sort(
      (first, second) =>
        new Date(second.wm_date).getTime() - new Date(first.wm_date).getTime(),
    );
  }, [historyData]);

  const currentYearRecords = records.filter((record) =>
    isCurrentYear(record.wm_date),
  );
  const visibleRecords =
    filter === "current-year" ? currentYearRecords : records;
  const latestRecord = records[0];
  const previousRecord = records[1];
  const weightDifference = getDifference(
    latestRecord?.weight,
    previousRecord?.weight,
  );
  const weightChange =
    weightDifference === null
      ? "-"
      : `${weightDifference > 0 ? "+" : ""}${weightDifference.toFixed(1)} kg`;

  const refresh = () => {
    if (!id) return;
    loadMemberDetail(id);
    loadWMHistory(id);
  };

  if ((isLoadingMember || isLoadingHistory) && !memberData && !historyData) {
    return <LoadingView />;
  }

  const hasError = isMemberError || isHistoryError;

  return (
    <ContainerPage
      titleHeader="Riwayat Weigh Measure"
      titleContent={member?.user.name ?? "Member"}
    >
      <FlatList
        data={visibleRecords}
        keyExtractor={(record, index) => record._id || String(index)}
        renderItem={({ item, index }) => (
          <WMHistoryCard
            record={item}
            sequence={visibleRecords.length - index}
          />
        )}
        refreshing={isLoadingMember || isLoadingHistory}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
        ListHeaderComponent={
          <View>
            <View className="mx-5 mt-5 rounded-3xl bg-[#6F3FA0] p-5 shadow-sm">
              <View className="flex-row items-center">
                {member?.photo ? (
                  <Image
                    source={{ uri: imageProfileURL(member.photo) }}
                    className="h-16 w-16 rounded-2xl border-2 border-white/30 bg-violet-100"
                  />
                ) : (
                  <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white">
                    <Text className="text-xl font-bold text-[#6F3FA0]">
                      {getInitials(member?.user.name ?? "")}
                    </Text>
                  </View>
                )}
                <View className="ml-4 flex-1">
                  <Text
                    numberOfLines={1}
                    className="text-xl font-bold text-white"
                  >
                    {member?.user.name ?? "Member"}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="mt-1 text-sm text-violet-200"
                  >
                    {member?.user.email || "Email belum tersedia"}
                  </Text>
                  <View className="mt-2 self-start rounded-full bg-white/15 px-2.5 py-1">
                    <Text className="text-xs font-semibold text-white">
                      Key Tag: {member?.key_tag_id || "-"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="mx-5 mt-4 flex-row gap-3">
              <StatCard
                icon="clipboard-outline"
                label="Total WM"
                value={String(records.length)}
                color="#6F3FA0"
                backgroundColor="#F3E8FF"
              />
              <StatCard
                icon="scale-outline"
                label="Berat Terakhir"
                value={formatMeasurement(latestRecord?.weight, " kg")}
                color="#0EA5E9"
                backgroundColor="#E0F2FE"
              />
              <StatCard
                icon="trending-down-outline"
                label="Perubahan"
                value={weightChange}
                color="#10B981"
                backgroundColor="#D1FAE5"
              />
            </View>

            <View className="mx-5 mb-4 mt-6">
              <View className="flex-row items-end justify-between">
                <View>
                  <Text className="text-xl font-bold text-gray-900 dark:text-white">
                    Daftar Pengukuran
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {visibleRecords.length} pengukuran ditampilkan
                  </Text>
                </View>
                <View className="flex-row rounded-xl bg-gray-100 p-1 dark:bg-zinc-800">
                  <TouchableOpacity
                    onPress={() => setFilter("current-year")}
                    className={`rounded-lg px-3 py-2 ${
                      filter === "current-year"
                        ? "bg-white dark:bg-zinc-700"
                        : ""
                    }`}
                  >
                    <Text className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      Tahun Ini
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFilter("all")}
                    className={`rounded-lg px-3 py-2 ${
                      filter === "all" ? "bg-white dark:bg-zinc-700" : ""
                    }`}
                  >
                    <Text className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      Semua
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8 pb-20">
            <View
              className={`mb-4 rounded-full p-5 ${
                hasError ? "bg-red-50" : "bg-sky-50 dark:bg-sky-950"
              }`}
            >
              <Ionicons
                name={hasError ? "alert-circle-outline" : "scale-outline"}
                size={40}
                color={hasError ? "#DC2626" : "#0EA5E9"}
              />
            </View>
            <Text className="text-center text-lg font-bold text-gray-800 dark:text-white">
              {hasError
                ? "Riwayat WM gagal dimuat"
                : filter === "current-year"
                  ? "Belum ada pengukuran tahun ini"
                  : "Belum ada riwayat pengukuran"}
            </Text>
            <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              {hasError
                ? "Tarik layar ke bawah untuk mencoba kembali."
                : "Hasil Weigh & Measure akan muncul di sini."}
            </Text>
          </View>
        }
      />
    </ContainerPage>
  );
}
