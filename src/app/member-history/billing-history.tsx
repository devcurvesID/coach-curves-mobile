import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import Text from "@/components/ui/text";
import { formatCurrency, formatDate, getDateTime } from "@/helpers/dates";
import { useDetailMemberByUserId } from "@/hooks/useMember";
import {
  useMemberBillByUserId,
  useMemberBillingByUserId,
} from "@/hooks/usePayments";
import { imageProfileURL } from "@/services/image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  FlatList,
  Image,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";

interface MemberDetail {
  photo?: string | null;
  joined?: string | null;
  user: { name: string; email?: string | null };
}

interface BillingRecord {
  _id?: string;
  payment_category?: string | null;
  payment_number?: string | null;
  payment_status?: string | null;
  payment_date?: string | null;
  payment_method?: { payment_method?: string | null } | null;
  amount_paid?: number | string | null;
  amount_due?: number | string | null;
  rest_of_bill?: number | string | null;
}

interface MemberBillSummary {
  grand_total_amount_paid?: number | string | null;
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

const toNumber = (value?: number | string | null): number => {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
};

const isPaid = (status?: string | null): boolean =>
  status?.trim().toLowerCase() === "paid";

function SummaryCard({
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
    <View className="flex-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor }}
      >
        <Ionicons name={icon} size={21} color={color} />
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        className="mt-3 text-lg font-bold text-gray-900 dark:text-white"
      >
        {value}
      </Text>
      <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {label}
      </Text>
    </View>
  );
}

function BillingCard({ record }: { record: BillingRecord }) {
  const router = useRouter();
  const paid = isPaid(record.payment_status);
  const openDetail = () => {
    if (!record.payment_number) return;
    router.push({
      pathname: "/user/details-bill",
      params: { data: JSON.stringify(record) },
    });
  };

  return (
    <Pressable
      onPress={openDetail}
      disabled={!record.payment_number}
      className="mx-5 mb-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <View className="flex-row items-start">
        <View
          className={`h-12 w-12 items-center justify-center rounded-2xl ${paid ? "bg-emerald-50" : "bg-orange-50"}`}
        >
          <MaterialCommunityIcons
            name={
              paid ? "check-decagram-outline" : "receipt-text-clock-outline"
            }
            size={25}
            color={paid ? "#059669" : "#EA580C"}
          />
        </View>
        <View className="ml-3 flex-1">
          <View className="flex-row items-start justify-between">
            <View className="mr-2 flex-1">
              <Text className="font-bold text-gray-900 dark:text-white">
                {record.payment_category?.trim() || "Pembayaran Member"}
              </Text>
              <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {record.payment_number || "Nomor pembayaran belum tersedia"}
              </Text>
            </View>
            <View
              className={`rounded-full px-3 py-1 ${paid ? "bg-emerald-50" : "bg-orange-50"}`}
            >
              <Text
                className={`text-[10px] font-bold ${paid ? "text-emerald-700" : "text-orange-700"}`}
              >
                {record.payment_status?.trim() || "Belum dibayar"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mt-4 rounded-2xl bg-violet-50 p-4 dark:bg-violet-950">
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          Total Dibayar
        </Text>
        <Text className="mt-1 text-2xl font-bold text-[#6F3FA0] dark:text-violet-300">
          {formatCurrency(toNumber(record.amount_paid))}
        </Text>
        <View className="mt-4 flex-row gap-3">
          <View className="flex-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Total Tagihan
            </Text>
            <Text className="mt-1 font-semibold text-gray-800 dark:text-white">
              {formatCurrency(toNumber(record.amount_due))}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Sisa Tagihan
            </Text>
            <Text
              className={`mt-1 font-semibold ${toNumber(record.rest_of_bill) > 0 ? "text-red-500" : "text-emerald-600"}`}
            >
              {formatCurrency(toNumber(record.rest_of_bill))}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between border-t border-gray-100 pt-4 dark:border-zinc-800">
        <View className="mr-2 flex-row items-center">
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
            {record.payment_date
              ? getDateTime(new Date(record.payment_date))
              : "Tanggal belum tersedia"}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="card-outline" size={16} color="#6B7280" />
          <Text className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
            {record.payment_method?.payment_method?.trim() || "Tunai"}
          </Text>
        </View>
      </View>

      {record.payment_number ? (
        <View className="mt-4 flex-row items-center justify-end">
          <Text className="mr-1 text-xs font-semibold text-[#6F3FA0]">
            Lihat detail
          </Text>
          <Ionicons name="arrow-forward" size={15} color="#6F3FA0" />
        </View>
      ) : null}
    </Pressable>
  );
}

export default function BillingHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    mutate: loadMemberDetail,
    data: memberData,
    isPending: isLoadingMember,
    isError: isMemberError,
  } = useDetailMemberByUserId();
  const {
    mutate: loadBillingHistory,
    data: billingData,
    isPending: isLoadingBilling,
    isError: isBillingError,
  } = useMemberBillingByUserId();
  const {
    data: memberBillData,
    isLoading: isLoadingMemberBill,
    isError: isMemberBillError,
    refetch: refreshMemberBill,
  } = useMemberBillByUserId(id);

  useEffect(() => {
    if (!id) return;
    loadMemberDetail(id);
    loadBillingHistory(id);
  }, [id, loadBillingHistory, loadMemberDetail]);

  const member = memberData as MemberDetail | undefined;
  const records = useMemo(
    () => (Array.isArray(billingData) ? (billingData as BillingRecord[]) : []),
    [billingData],
  );
  const memberBill = memberBillData as MemberBillSummary | undefined;
  const totalPaid = toNumber(memberBill?.grand_total_amount_paid);
  const canViewPaymentInformation = totalPaid > 0;
  const totalOutstanding = records.reduce(
    (total, record) => total + toNumber(record.rest_of_bill),
    0,
  );
  const hasError = isMemberError || isBillingError || isMemberBillError;

  const refresh = () => {
    if (!id) return;
    loadMemberDetail(id);
    loadBillingHistory(id);
    refreshMemberBill();
  };

  const openPaymentInformation = () => {
    if (!id || !canViewPaymentInformation) return;
    router.push({
      pathname: "/member-history/detail-billing-history",
      params: {
        id,
        memberName: member?.user.name ?? "Member",
      },
    });
  };

  if (
    (isLoadingMember || isLoadingBilling || isLoadingMemberBill) &&
    !memberData &&
    !billingData &&
    !memberBillData
  )
    return <LoadingView />;

  return (
    <ContainerPage
      titleHeader="Riwayat Pembayaran"
      titleContent={member?.user.name ?? "Member"}
    >
      <FlatList
        data={records}
        keyExtractor={(record, index) => record._id || String(index)}
        renderItem={({ item }) => <BillingCard record={item} />}
        refreshing={isLoadingMember || isLoadingBilling || isLoadingMemberBill}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
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
                      Bergabung:{" "}
                      {member?.joined ? formatDate(member.joined) : "-"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="mx-5 mt-4 flex-row gap-3">
              <SummaryCard
                icon="receipt-outline"
                label="Total Transaksi"
                value={String(records.length)}
                color="#6F3FA0"
                backgroundColor="#F3E8FF"
              />
              <SummaryCard
                icon="checkmark-circle-outline"
                label="Sudah Dibayar"
                value={formatCurrency(totalPaid)}
                color="#059669"
                backgroundColor="#D1FAE5"
              />
              <SummaryCard
                icon="alert-circle-outline"
                label="Sisa Tagihan"
                value={formatCurrency(totalOutstanding)}
                color="#DC2626"
                backgroundColor="#FEE2E2"
              />
            </View>

            <View className="mx-5 mb-4 mt-6">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                Daftar Pembayaran
              </Text>
              <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {records.length} transaksi ditemukan
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8 pb-20">
            <View
              className={`mb-4 rounded-full p-5 ${hasError ? "bg-red-50" : "bg-violet-50 dark:bg-violet-950"}`}
            >
              <Ionicons
                name={hasError ? "alert-circle-outline" : "receipt-outline"}
                size={42}
                color={hasError ? "#DC2626" : "#6F3FA0"}
              />
            </View>
            <Text className="text-center text-lg font-bold text-gray-900 dark:text-white">
              {hasError
                ? "Riwayat pembayaran gagal dimuat"
                : "Belum ada riwayat pembayaran"}
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-gray-500 dark:text-gray-400">
              {hasError
                ? "Periksa koneksi Anda, lalu coba muat kembali data pembayaran."
                : "Transaksi dan informasi tagihan member akan ditampilkan di sini setelah tersedia."}
            </Text>
            <TouchableOpacity
              onPress={refresh}
              className="mt-5 flex-row items-center rounded-2xl bg-[#6F3FA0] px-5 py-3"
            >
              <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
              <Text className="ml-2 font-bold text-white">
                {hasError ? "Coba Lagi" : "Perbarui Data"}
              </Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            onPress={openPaymentInformation}
            disabled={!canViewPaymentInformation}
            activeOpacity={0.85}
            className={`mx-5 mt-2 flex-row items-center justify-center rounded-2xl px-5 py-4 ${
              canViewPaymentInformation ? "bg-[#6F3FA0]" : "bg-gray-300"
            }`}
          >
            <Ionicons
              name={
                canViewPaymentInformation
                  ? "document-text-outline"
                  : "lock-closed-outline"
              }
              size={19}
              color="#FFFFFF"
            />
            <Text className="ml-2 text-center font-bold text-white">
              {canViewPaymentInformation
                ? "Lihat Informasi Pembayaran"
                : "Belum Ada Pembayaran"}
            </Text>
          </TouchableOpacity>
        }
      />
    </ContainerPage>
  );
}
