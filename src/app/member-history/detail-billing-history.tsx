import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import Text from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { formatCurrency, getDateTime } from "@/helpers/dates";
import { useUserClub } from "@/hooks/useClubs";
import {
  useDetailMemberBillingByUserId,
  useMemberBillByUserId,
} from "@/hooks/usePayments";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";

export default function DetailBillingHistoryScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { id } = params;
  console.log("params", id);
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: userClub, isLoading: isLoadingUserClub } = useUserClub();

  const {
    mutate: memberPaymentBillingByUserIdFn,
    data: memberPayment,
    isPending: isPendingMemberPayment,
  } = useDetailMemberBillingByUserId();

  const user_personal = user.user_personal;
  const {
    mutate: memberBillByUserIdFn,
    data: memberBill,
    isPending: isPendingMemberBill,
  } = useMemberBillByUserId();

  useEffect(() => {
    async function getProgress() {
      await memberPaymentBillingByUserIdFn(id);
    }
    getProgress();
  }, []);
  useEffect(() => {
    async function getProgress() {
      await memberBillByUserIdFn(id);
    }
    getProgress();
  }, []);
  if (
    isPendingMemberPayment ||
    isPendingMemberBill ||
    isLoadingUserClub ||
    !memberPayment ||
    !memberBill
  ) {
    return <LoadingView />;
  }

  console.log("memberPayment", memberPayment);
  console.log("memberBill", memberBill);

  const onDetail = () => {
    router.push({
      pathname: "/member-history/detail-billing-history",
      params: {
        id: id,
      },
    });
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
                {userClub[0].club_name}
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
                  {user.name}
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
                  {user.sales_person.name}
                </Text>
              </View>
              <View className="border-t border-dashed border-gray-300 mt-8" />

              <Text className="text-xl font-bold text-gray-800 mt-2 text-center">
                Riwayat Pembayaran
              </Text>
              {memberPayment.map((payment: any, idx: number) => {
                return (
                  <View className="gap-5" key={idx.toString()}>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#6F3FA0"
                      />
                      <Text className="text-lg font-bold text-gray-800 ml-3">
                        {getDateTime(payment.payment_date)}
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
                          {formatCurrency(payment.amount_paid)}
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
                        {formatCurrency(payment.amount_paid)}
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
                        {formatCurrency(payment.dc_amount)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 text-base">Pajak</Text>

                      <Text className="font-semibold text-base text-gray-800">
                        {formatCurrency(payment.tax_amount)}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {/* Cashier */}
            </View>

            {/* DIVIDER */}
            <View className="border-t border-dashed border-gray-300 my-8" />

            {/* PAYMENT DETAIL */}
            <View className="gap-5">
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-base">Biaya Layanan</Text>

                <Text className="font-semibold text-base text-gray-800">
                  {formatCurrency(memberBill.total_bill_amount)}
                  {/* {formatCurrency(payment.amount_due)} */}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-base">
                  Biaya Yang Sudah Dibayar
                </Text>

                <Text className="font-semibold text-base text-gray-800">
                  {formatCurrency(memberBill.grand_total_amount_paid)}
                </Text>
              </View>
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
                    Total
                  </Text>
                </View>

                <Text className="text-2xl font-bold text-[#6F3FA0]">
                  {formatCurrency(memberBill.grand_total_amount_paid)}
                  {/* {total_amount()} */}
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
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-gray-500">Sisa Hutang</Text>

                <Text className="text-xl font-bold text-red-500">
                  {formatCurrency(memberBill.rest_of_bill)}
                  {/* {formatCurrency(payment.rest_of_bill)} */}
                </Text>
              </View>
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
                Keep crushing your workout 💪
              </Text>
            </View>
          </View>
        </ScrollView>
      </ContainerPage>
    </>
  );
}

const BillsView = ({ data }: any) => {
  const router = useRouter();

  const onDetail = () => {
    console.log("SUBMIT:", data);
    if (data.payment_number) {
      router.push({
        pathname: "/user/details-bill",
        params: { data: JSON.stringify(data) }, //{ ...data, bank: { ...data.bank } },
      });
    }

    // 🔥 call API di sini
  };
  return (
    <>
      <View key={data._id} className="bg-white rounded-3xl mb-5 ">
        {/* TOP */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text
              numberOfLines={1}
              className="text-base font-bold text-gray-800"
            >
              {data.payment_category}
            </Text>

            <Text className="text-xs text-gray-400 mt-1">
              {data.payment_number}
            </Text>
          </View>

          <View
            className={`px-3 py-1 rounded-full ${
              data.payment_status === "Paid" ? "bg-green-100" : "bg-orange-100"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                data.payment_status === "Paid"
                  ? "text-green-600"
                  : "text-orange-600"
              }`}
            >
              {data.payment_status}
            </Text>
          </View>
        </View>
        {/* AMOUNT */}
        <Pressable
          onPress={onDetail}
          className="mt-5 bg-[#F8F5FF] rounded-2xl p-4"
        >
          <Text className="text-xs text-gray-400">Total Dibayar</Text>

          <Text className="text-2xl font-bold text-[#6F3FA0] mt-1">
            {formatCurrency(data.amount_paid)}
          </Text>

          <View className="flex-row justify-between mt-4">
            <View>
              <Text className="text-xs text-gray-400">Sisa Tagihan</Text>

              <Text className="text-sm font-semibold text-red-500 mt-1">
                {formatCurrency(data.rest_of_bill)}
              </Text>
            </View>

            <View>
              <Text className="text-xs text-gray-400">Total Tagihan</Text>

              <Text className="text-sm font-semibold text-gray-800 mt-1">
                {formatCurrency(data.amount_due)}
              </Text>
            </View>
          </View>
        </Pressable>

        {/* FOOTER */}
        <View className="flex-row justify-between mt-5">
          <View className="flex-row items-center">
            {/* <Calendar size={16} color="#888" /> */}
            <MaterialCommunityIcons
              name="calendar-check"
              size={18}
              color={data.payment_status === "Paid" ? "#10B981" : "#F43F5E"}
            />
            <Text className="text-xs text-gray-500 ml-2">
              {getDateTime(data.payment_date)}
            </Text>
          </View>

          <View className="flex-row items-center">
            {/* <CreditCard size={16} color="#888" /> */}
            <MaterialCommunityIcons
              name="credit-card"
              size={18}
              color={data.payment_status === "Paid" ? "#10B981" : "#F43F5E"}
            />
            <Text className="text-xs text-gray-500 ml-2">
              {data.payment_method_id
                ? data.payment_method.payment_method
                : "Tunai"}
            </Text>
          </View>
        </View>
      </View>
      <View className="h-[1px] bg-[#BB86FC] my-5" />
    </>
  );
};
