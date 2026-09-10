import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import Text from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { formatCurrency, getDateTime } from "@/helpers/dates";
import { useUserClub } from "@/hooks/useClubs";
import {
  useDetailMemberBillingByUserId,
  useMemberBillByUserId,
  useMemberBillingByUserId,
} from "@/hooks/usePayments";
import { buildBillingHistoryPdfHtml } from "@/utils/billing-history-pdf";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import dayjs from "dayjs";
import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import { useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";

interface PaymentHistoryItem {
  _id?: string;
  payment_date?: string | Date | null;
  payment_category?: string | null;
  payment_number?: string | null;
  amount_paid?: number | string | null;
  mf_amount?: number | string | null;
  dc_amount?: number | string | null;
  tax_amount?: number | string | null;
  sf_amount?: number | string | null;
}

interface MemberBillSummary {
  total_bill_amount?: number | string | null;
  grand_total_amount_paid?: number | string | null;
  dc_amount?: number | string | null;
  rest_of_bill?: number | string | null;
}

const toNumber = (value?: number | string | null): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const createPaymentPdfFileName = (memberName: string): string => {
  const safeMemberName = memberName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
  const savedAt = dayjs().format("DD-MM-YYYY_HH-mm-ss");

  return `PAYMENT-${safeMemberName || "MEMBER"}_${savedAt}.pdf`;
};

export default function DetailBillingHistoryScreen() {
  const { id, memberName } = useLocalSearchParams<{
    id: string;
    memberName?: string;
  }>();
  const { user } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [pdfAction, setPdfAction] = useState<"preview" | "download" | null>(
    null,
  );
  const { data: userClub, isLoading: isLoadingUserClub } = useUserClub();

  const {
    mutateAsync: loadPaymentDetails,
    data: memberPayment,
    isPending: isPendingMemberPayment,
  } = useDetailMemberBillingByUserId();

  const {
    mutateAsync: checkMemberBilling,
    data: memberBilling,
    isPending: isCheckingMemberBilling,
  } = useMemberBillingByUserId();

  const { data: memberBill, isLoading: isPendingMemberBill } =
    useMemberBillByUserId(id);

  useEffect(() => {
    if (!id) {
      setIsInitializing(false);
      return;
    }
    setIsInitializing(true);

    const loadBillingInformation = async () => {
      try {
        await checkMemberBilling(id);
      } catch {
        // Detail transaksi tetap dimuat sebagai sumber perhitungan fallback.
      }
      try {
        await loadPaymentDetails(id);
      } catch {
        // Status error dikelola oleh mutation dan tampilan data kosong.
      } finally {
        setIsInitializing(false);
      }
    };

    void loadBillingInformation();
  }, [checkMemberBilling, id, loadPaymentDetails]);

  if (
    isPendingMemberPayment ||
    isCheckingMemberBilling ||
    isPendingMemberBill ||
    isLoadingUserClub ||
    isInitializing
  ) {
    return <LoadingView />;
  }

  const paymentHistory = Array.isArray(memberPayment)
    ? (memberPayment as any[])
    : [];
  const billingRecords = Array.isArray(memberBilling) ? memberBilling : [];
  const billSummary = (memberBill ?? {}) as any;
  const shouldCalculateFromHistory = billingRecords.length === 0;
  const historyTotals = paymentHistory.reduce(
    (total, payment: any) => ({
      paid: total.paid + toNumber(payment.amount_paid),
      membershipFee: toNumber(payment.mf_amount),
      discount: total.discount + toNumber(payment.dc_amount),
      sf_amount: toNumber(payment.sf_amount),
    }),
    { paid: 0, membershipFee: 0, discount: 0, sf_amount: 0 },
  );
  const totalPaid = shouldCalculateFromHistory
    ? historyTotals.paid
    : toNumber(billSummary.grand_total_amount_paid);
  const totalDiscount = shouldCalculateFromHistory
    ? historyTotals.discount
    : toNumber(billSummary.dc_amount);
  const totalServiceFee = shouldCalculateFromHistory
    ? historyTotals.membershipFee
    : toNumber(billSummary.total_bill_amount);
  const grandtotalServiceFee = shouldCalculateFromHistory
    ? historyTotals.membershipFee
    : toNumber(billSummary.total_bill_amount);
  const grandTotal = totalPaid;
  const remainingDebt = toNumber(billSummary.rest_of_bill);
  const isPaidOff = toNumber(totalPaid) - toNumber(grandTotal);
  const totalServiceFee2 = shouldCalculateFromHistory
    ? historyTotals.sf_amount
    : toNumber(billSummary.sf_amount);
  const clubName = userClub?.[0]?.club_name || "Curves";
  const recipientName = memberName || "Member";
  const cashierName = user?.sales_person?.name || user?.name || "Coach";

  const createPdfHtml = () =>
    buildBillingHistoryPdfHtml({
      clubName,
      memberName: recipientName,
      cashierName,
      transactions: paymentHistory as PaymentHistoryItem[],
      serviceFee: totalServiceFee2,
      membershipFee: totalServiceFee,
      discount: totalDiscount,
      amountDue: totalPaid,
      amountPaid: grandTotal,
      remainingDebt,
      isPaidOff: isPaidOff === 0,
    });

  const previewPdf = async () => {
    if (pdfAction) return;
    setPdfAction("preview");
    try {
      await Print.printAsync({ html: createPdfHtml() });
    } catch {
      Alert.alert(
        "PDF Tidak Dapat Ditampilkan",
        "Terjadi kendala saat membuat preview PDF pembayaran.",
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
      const generatedFile = new File(uri);
      const namedFile = new File(
        Paths.cache,
        createPaymentPdfFileName(recipientName),
      );
      if (namedFile.exists) namedFile.delete();
      generatedFile.move(namedFile);

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          "PDF Berhasil Dibuat",
          "Fitur penyimpanan tidak tersedia pada perangkat ini.",
        );
        return;
      }
      await Sharing.shareAsync(namedFile.uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: `Simpan Riwayat Pembayaran ${recipientName}`,
      });
    } catch {
      Alert.alert(
        "PDF Tidak Dapat Disimpan",
        "Terjadi kendala saat membuat file PDF pembayaran.",
      );
    } finally {
      setPdfAction(null);
    }
  };

  return (
    <>
      <ContainerPage
        titleHeader="Detail Pembayaran"
        titleContent="Detail Pembayaran"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 5,
            paddingBottom: 120,
          }}
        >
          {/* RECEIPT CARD */}
          <View className="bg-white rounded-[32px] p-6 shadow-sm">
            {/* LOGO */}
            <View className="items-center">
              <Image
                source={require("@/assets/images/curves.jpg")}
                resizeMode="contain"
                className="w-36 h-20"
              />

              <Text className="text-xl font-bold text-gray-800 mt-2">
                {clubName}
              </Text>
            </View>

            {/* MEMBER INFO */}
            <View className="mt-10 gap-6">
              {/* Membership */}
              {/* <View className="flex-row justify-between items-start">
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="card-account-details-outline"
                  size={18}
                  color="#9CA3AF"
                />

                <Text className="text-gray-400 text-base ml-2">
                  Tipe Keanggotaan
                </Text>
              </View>

              <Text className="font-semibold text-base text-gray-800">
                {memberStatus.membership_type
                  ? memberStatus.membership_type.membership_type_name
                  : "-"}
              </Text>
            </View> */}
              <View className="flex-row justify-between items-start">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="card-account-details-outline"
                    size={18}
                    color="#9CA3AF"
                  />

                  <Text className="text-gray-400 text-base ml-2">
                    Tipe Keanggotaan
                  </Text>
                </View>

                <Text className="font-semibold text-base text-gray-800">
                  Member
                </Text>
              </View>

              {/* Member Name */}
              <View className="flex-row justify-between items-start">
                <View className="flex-row items-center">
                  <Ionicons name="person-outline" size={18} color="#9CA3AF" />

                  <Text className="text-gray-400 text-base ml-2">
                    Terima Dari
                  </Text>
                </View>

                <Text className="font-semibold text-base text-gray-800 flex-1 text-right ml-4">
                  {recipientName}
                </Text>
              </View>
              <View className="flex-row justify-between items-start">
                <View className="flex-row items-center">
                  <Ionicons
                    name="person-circle-outline"
                    size={18}
                    color="#9CA3AF"
                  />

                  <Text className="text-gray-400 text-base ml-2">Kasir</Text>
                </View>

                <Text className="font-semibold text-base text-gray-800">
                  {cashierName}
                </Text>
              </View>
              <View className="border-t border-dashed border-gray-300 mt-8" />

              <Text className="text-xl font-bold text-gray-800 mt-2 text-center">
                Riwayat Pembayaran
              </Text>
              {paymentHistory.map((payment, idx) => {
                return (
                  <View
                    className="gap-5"
                    key={payment._id || `${payment.payment_date}-${idx}`}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#6F3FA0"
                      />
                      <Text className="text-lg font-bold text-gray-800 ml-3">
                        {payment.payment_date
                          ? getDateTime(new Date(payment.payment_date))
                          : "Tanggal belum tersedia"}
                      </Text>
                    </View>
                    <View className="bg-[#F8F5FF] rounded-2xl p-5">
                      <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                          <Ionicons
                            name="wallet-outline"
                            size={18}
                            color="#6F3FA0"
                          />

                          <Text className="ml-2 text-gray-700 font-medium">
                            {payment.payment_category}
                          </Text>
                        </View>

                        <Text className="font-bold text-[#6F3FA0]">
                          {formatCurrency(toNumber(payment.amount_paid))}
                        </Text>
                      </View>
                    </View>
                    {/* Invoice */}
                    <View className="flex-row justify-between items-start">
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons
                          name="file-document-outline"
                          size={18}
                          color="#9CA3AF"
                        />

                        <Text className="text-gray-400 text-base ml-2">
                          No Invoice
                        </Text>
                      </View>

                      <Text className="font-semibold text-base text-gray-800 flex-1 text-right ml-4">
                        {payment.payment_number ? payment.payment_number : "-"}
                      </Text>
                    </View>

                    <View className="flex-row justify-between items-start">
                      <View className="flex-row items-center">
                        <FontAwesome5
                          name="money-bill-alt"
                          size={18}
                          color="#9CA3AF"
                        />

                        <Text className="text-gray-400 text-base ml-2">
                          Jumlah yang dibayarkan
                        </Text>
                      </View>

                      <Text className="font-semibold text-base text-gray-800">
                        {formatCurrency(toNumber(payment.amount_paid))}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-start">
                      <View className="flex-row items-center">
                        <FontAwesome5
                          name="money-bill-alt"
                          size={18}
                          color="#9CA3AF"
                        />

                        <Text className="text-gray-400 text-base ml-2">
                          Diskon
                        </Text>
                      </View>

                      <Text className="font-semibold text-base text-gray-800">
                        {formatCurrency(toNumber(payment.dc_amount))}
                      </Text>
                    </View>
                    {/* <View className="flex-row justify-between">
                      <Text className="text-gray-500 text-base">Pajak</Text>

                      <Text className="font-semibold text-base text-gray-800">
                        {formatCurrency(toNumber(payment.tax_amount))}
                      </Text>
                    </View> */}
                  </View>
                );
              })}
              {paymentHistory.length === 0 && (
                <View className="items-center rounded-2xl bg-slate-50 px-5 py-8">
                  <Ionicons name="receipt-outline" size={34} color="#94A3B8" />
                  <Text className="mt-3 text-center font-semibold text-slate-700">
                    Belum ada detail transaksi
                  </Text>
                  <Text className="mt-1 text-center text-xs leading-5 text-slate-500">
                    Riwayat pembayaran per tanggal belum tersedia.
                  </Text>
                </View>
              )}

              {/* Cashier */}
            </View>

            <View className="mt-8 rounded-3xl border border-violet-100 bg-violet-50 p-5">
              <View className="flex-row items-start">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white">
                  <Ionicons
                    name="document-text-outline"
                    size={23}
                    color="#6F3FA0"
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-lg font-bold text-gray-900">
                    Riwayat Pembayaran PDF
                  </Text>
                  <Text className="mt-1 text-xs leading-5 text-gray-500">
                    Lihat dokumen atau simpan untuk arsip dan dibagikan kepada
                    member.
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row gap-3">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Lihat riwayat pembayaran dalam PDF"
                  disabled={pdfAction !== null}
                  onPress={() => void previewPdf()}
                  className="flex-1 flex-row items-center justify-center rounded-2xl border border-violet-200 bg-white py-3.5"
                >
                  {pdfAction === "preview" ? (
                    <ActivityIndicator size="small" color="#6F3FA0" />
                  ) : (
                    <Ionicons name="eye-outline" size={19} color="#6F3FA0" />
                  )}
                  <Text className="ml-2 font-bold text-[#6F3FA0]">
                    Lihat PDF
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Simpan riwayat pembayaran sebagai PDF"
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

            {/* DIVIDER */}
            <View className="border-t border-dashed border-gray-300 my-8" />

            {/* PAYMENT DETAIL */}
            <View className="gap-5">
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-base">
                  Total Biaya Layanan
                </Text>

                <Text className="font-semibold text-base text-gray-800">
                  {formatCurrency(totalServiceFee2)}
                  {/* {formatCurrency(payment.amount_due)} */}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-base">
                  Total Biaya Keanggotaan
                </Text>

                <Text className="font-semibold text-base text-gray-800">
                  {formatCurrency(totalServiceFee)}
                  {/* {formatCurrency(payment.amount_due)} */}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-base">Total diskon</Text>

                <Text className="font-semibold text-base text-gray-800">
                  {formatCurrency(totalDiscount)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-base">
                  Total yang harus dibayar
                </Text>

                <Text className="font-semibold text-base text-gray-800">
                  {formatCurrency(totalPaid)}
                </Text>
              </View>

              {shouldCalculateFromHistory && paymentHistory.length > 0 && (
                <View className="flex-row items-start rounded-2xl bg-amber-50 p-4">
                  <Ionicons
                    name="calculator-outline"
                    size={20}
                    color="#D97706"
                  />
                  <Text className="ml-3 flex-1 text-xs leading-5 text-amber-700">
                    Ringkasan dihitung dari seluruh pembayaran dan diskon pada
                    setiap tanggal transaksi.
                  </Text>
                </View>
              )}
              {/* <View className="flex-row justify-between">
              <Text className="text-gray-500 text-base">Pajak</Text>

              <Text className="font-semibold text-base text-gray-800">
                {formatCurrency(payment.tax_amount)}
              </Text>
            </View> 

            <View className="flex-row justify-between">
              <Text className="text-gray-500 text-base">Diskon</Text>

              <Text className="font-semibold text-base text-red-500">
                - {formatCurrency(payment.dc_amount)}
              </Text>
            </View>*/}
            </View>

            {/* DIVIDER */}
            <View className="border-t border-dashed border-gray-300 my-8" />

            {/* TOTAL */}
            <View className="gap-5">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <FontAwesome5
                    name="money-bill-wave"
                    size={16}
                    color="#6F3FA0"
                  />

                  <Text className="text-lg font-bold text-gray-800 ml-2">
                    Total yang sudah dibayar
                  </Text>
                </View>

                <Text className="text-2xl font-bold text-[#6F3FA0]">
                  {formatCurrency(grandTotal)}
                </Text>
              </View>

              {/* PAYMENT METHOD */}
              {/* <View className="bg-[#F8F5FF] rounded-2xl p-5">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons name="wallet-outline" size={18} color="#6F3FA0" />

                  <Text className="ml-2 text-gray-700 font-medium">
                    {payment.payment_category}
                  </Text>
                </View>

                <Text className="font-bold text-[#6F3FA0]">
                  {formatCurrency(payment.amount_paid)}
                </Text>
              </View>
            </View> */}

              {/* REMAINING */}
              {isPaidOff == 0 ? (
                <View className="flex-row items-center rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-emerald-100">
                    <Ionicons
                      name="checkmark-circle"
                      size={25}
                      color="#059669"
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="font-bold text-emerald-700">
                      Pembayaran Lunas
                    </Text>
                    <Text className="mt-1 text-xs text-emerald-600">
                      Tidak ada sisa hutang yang perlu dibayarkan.
                    </Text>
                  </View>
                  <Text className="font-bold text-emerald-700">
                    {formatCurrency(0)}
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center rounded-2xl border border-red-100 bg-red-50 p-4">
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-red-100">
                    <Ionicons name="alert-circle" size={25} color="#DC2626" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm text-red-600">Sisa Hutang</Text>
                    <Text className="mt-1 text-xl font-bold text-red-600">
                      {formatCurrency(remainingDebt)}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* DIVIDER */}
            <View className="border-t border-dashed border-gray-300 my-8" />

            {/* FOOTER */}
            <View className="items-center">
              <Text className="text-gray-500 text-sm">
                Sudah termasuk pajak
              </Text>

              <Text className="text-3xl font-bold text-[#6F3FA0] mt-10">
                Terima Kasih
              </Text>

              <Text className="text-gray-400 text-sm mt-2 text-center">
                {isPaidOff
                  ? "Pembayaran Anda telah diselesaikan."
                  : "Selesaikan pembayaran sesuai informasi tagihan."}
              </Text>
            </View>
          </View>
        </ScrollView>
      </ContainerPage>
    </>
  );
}
