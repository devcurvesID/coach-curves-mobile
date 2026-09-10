import ContainerPage from "@/components/ui/container-page";
import { useAuth } from "@/context/auth";
import { formatCurrency, formatDate } from "@/helpers/dates";
import { getPaymentOverdueDays } from "@/helpers/payment-overdue";
import { ClubPayment, useClubMemberPayments } from "@/hooks/usePayments";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function formatAmount(value: ClubPayment["amount_due"]): string {
  if (value == null || String(value).trim() === "") return "Belum tersedia";
  const amount = Number(value);
  return Number.isFinite(amount) ? formatCurrency(amount) : "Belum tersedia";
}

function PaymentCard({ payment }: { payment: ClubPayment }) {
  const overdueDays = getPaymentOverdueDays(payment);
  const isPaid = payment.payment_status?.toLowerCase() === "paid";
  const paymentDate =
    payment.payment_date && !Number.isNaN(Date.parse(payment.payment_date))
      ? formatDate(payment.payment_date)
      : "Tanggal belum tersedia";

  return (
    <View className="mb-4 rounded-3xl border border-gray-100 bg-white p-4  ">
      <View className="flex-row items-start">
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
          <Ionicons name="receipt-outline" size={23} color="#2563EB" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900 ">
            {payment.user?.name || "Nama member belum tersedia"}
          </Text>
          <Text className="mt-1 text-xs text-gray-500 ">
            {payment.payment_category || "Tagihan member"}
          </Text>
        </View>
      </View>
      <View className="mt-3 flex-row flex-wrap items-center gap-2">
        <View
          className={`rounded-full px-3 py-1 ${isPaid ? "bg-emerald-50" : "bg-gray-100"}`}
        >
          <Text
            className={`text-xs font-semibold ${isPaid ? "text-emerald-700" : "text-gray-600"}`}
          >
            {isPaid
              ? "Lunas"
              : payment.payment_status || "Status belum tersedia"}
          </Text>
        </View>
        <Text className="text-xs text-gray-500 ">
          {paymentDate}
        </Text>
      </View>
      {overdueDays !== null && overdueDays > 0 ? (
        <View
          accessibilityLabel={`Pembayaran terlambat ${overdueDays} hari`}
          className="mt-3 flex-row items-center rounded-xl border border-red-100 bg-red-50 p-3  "
        >
          <Ionicons name="time-outline" size={20} color="#DC2626" />
          <View className="ml-2 flex-1">
            <Text className="text-sm font-bold text-red-700 ">
              Terlambat {overdueDays} hari
            </Text>
            <Text className="mt-1 text-xs text-red-600 ">
              Dihitung dari tanggal tagihan {paymentDate}.
            </Text>
          </View>
        </View>
      ) : null}
      <Text
        selectable
        className="mt-3 text-xs text-gray-500 "
      >
        No. pembayaran: {payment.payment_number || "—"}
      </Text>
      <View className="mt-4 rounded-2xl bg-blue-50 p-4 ">
        <Text className="text-xs text-gray-600 ">
          Total Tagihan
        </Text>
        <Text className="mt-1 text-xl font-bold text-blue-700 ">
          {formatAmount(payment.amount_due)}
        </Text>
        <View className="mt-4 flex-row gap-3">
          <View className="flex-1">
            <Text className="text-xs text-gray-600 ">
              Sudah Dibayar
            </Text>
            <Text className="mt-1 font-semibold text-gray-900 ">
              {formatAmount(payment.amount_paid)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-600 ">
              Sisa Tagihan
            </Text>
            <Text className="mt-1 font-semibold text-gray-900 ">
              {formatAmount(payment.rest_of_bill)}
            </Text>
          </View>
        </View>
      </View>
      {typeof payment.user_id === "string" && payment.user_id.trim() ? (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: "/member-history/billing-history",
              params: { id: payment.user_id! },
            })
          }
          className="mt-4 flex-row items-center justify-center rounded-xl bg-violet-50 px-3 py-3 "
        >
          <Text className="mr-2 font-semibold text-violet-700 ">
            Riwayat Pembayaran Member
          </Text>
          <Ionicons name="arrow-forward" size={17} color="#8B5CF6" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function MemberPaymentsScreen() {
  const { user } = useAuth();
  const firstClub: unknown = user?.club_id?.[0];
  const rawClubId =
    typeof firstClub === "string"
      ? firstClub
      : firstClub && typeof firstClub === "object" && "_id" in firstClub
        ? firstClub._id
        : undefined;
  const clubId = typeof rawClubId === "string" ? rawClubId : undefined;
  const {
    data,
    isLoading,
    isError,
    isRefetching,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useClubMemberPayments(clubId);
  const payments = data?.pages.flatMap((page) => page.response) ?? [];
  const total = data?.pages[0]?.total;

  return (
    <ContainerPage
      titleHeader="Tagihan Anggota"
      titleContent="Pembayaran member di club Anda"
    >
      <FlatList
        data={payments}
        keyExtractor={(item, index) =>
          item._id || `${item.payment_number ?? "payment"}-${index}`
        }
        renderItem={({ item }) => <PaymentCard payment={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={() => {
          if (clubId) void refetch();
        }}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (
            hasNextPage &&
            !isFetchingNextPage &&
            !isRefetching &&
            !isFetchNextPageError
          )
            void fetchNextPage();
        }}
        ListHeaderComponent={
          <View className="mb-5">
            <View className="rounded-2xl bg-blue-50 p-4 ">
              <Text className="font-bold text-blue-800 ">
                Daftar Tagihan Club
              </Text>
              <Text className="mt-1 text-sm text-gray-600 ">
                {isLoading
                  ? "Memuat daftar pembayaran..."
                  : total !== undefined
                    ? `${payments.length} dari ${total} tagihan ditampilkan`
                    : `${payments.length} tagihan ditampilkan`}
              </Text>
            </View>
            {isError && payments.length > 0 && !isFetchNextPageError ? (
              <TouchableOpacity
                onPress={() => void refetch()}
                accessibilityRole="button"
                className="mt-3 rounded-xl bg-red-50 p-3"
              >
                <Text className="text-sm text-red-700">
                  Pembaruan gagal. Ketuk untuk mencoba kembali.
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-8">
            {isLoading ? (
              <ActivityIndicator size="large" color="#6F3FA0" />
            ) : (
              <>
                <View className="mb-4 rounded-full bg-blue-50 p-5">
                  <Ionicons
                    name={
                      isError || !clubId
                        ? "alert-circle-outline"
                        : "receipt-outline"
                    }
                    size={38}
                    color="#2563EB"
                  />
                </View>
                <Text className="text-center text-lg font-bold text-gray-900 ">
                  {!clubId
                    ? "Club belum tersedia"
                    : isError
                      ? "Tagihan gagal dimuat"
                      : "Belum ada tagihan anggota"}
                </Text>
                <Text className="mt-2 text-center text-sm text-gray-500 ">
                  {!clubId
                    ? "Data club user login belum tersedia."
                    : isError
                      ? "Periksa koneksi lalu coba kembali."
                      : "Tagihan member akan muncul di sini ketika tersedia."}
                </Text>
                {clubId ? (
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => void refetch()}
                    className="mt-5 rounded-xl bg-[#6F3FA0] px-5 py-3"
                  >
                    <Text className="font-semibold text-white">
                      {isError ? "Coba Lagi" : "Perbarui Data"}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </>
            )}
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color="#6F3FA0" />
          ) : isFetchNextPageError ? (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => void fetchNextPage()}
              className="rounded-xl bg-violet-50 p-4"
            >
              <Text className="text-center text-violet-700">
                Gagal memuat lanjutan. Coba lagi
              </Text>
            </TouchableOpacity>
          ) : payments.length > 0 ? (
            <Text className="text-center text-xs text-gray-500">
              {hasNextPage
                ? "Gulir untuk melihat tagihan berikutnya"
                : "Semua tagihan telah ditampilkan"}
            </Text>
          ) : null
        }
      />
    </ContainerPage>
  );
}
