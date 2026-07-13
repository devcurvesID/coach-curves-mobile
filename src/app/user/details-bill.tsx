import ContainerPage from "@/components/ui/container-page";
import { useAuth } from "@/context/auth";
import { formatCurrency, getDateTime } from "@/helpers/dates";
import { useUserClub } from "@/hooks/useClubs";
import { useMemberBill, useMemberPayment } from "@/hooks/usePayments";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";

export default function DetailBillScreen() {
  const { data: memberPayment, isLoading: isLoadingMemberPayment } =
    useMemberPayment();
  const { data: userClub, isLoading: isLoadingUserClub } = useUserClub();

  const { data: memberBill, isLoading: isLoadingBill } = useMemberBill();
  console.log("memberBill", memberBill);

  const { user, isLoading, signOut } = useAuth();

  console.log("memberBill", memberBill);

  const router = useRouter();

  const onSubmit = (data: any) => {
    console.log("SUBMIT:", data);
    // 🔥 call API di sini
  };

  if (isLoadingUserClub || isLoadingBill || isLoadingMemberPayment) {
    return (
      <View className="flax-1 items-center">
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <ContainerPage
      titleHeader="Detail Tagihan"
      titleContent="Lihat detail tagihan"
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
            <Text className="text-gray-500 text-sm">Sudah termasuk pajak</Text>

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
  );
}
