import ContainerPage from "@/components/ui/container-page";
import { FlatListItem } from "@/components/ui/flat-list-item";
import { LoadingView } from "@/components/ui/loading";
import Text from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { formatCurrency, formatDate, getDateTime } from "@/helpers/dates";
import { useDetailMemberByUserId } from "@/hooks/useMember";
import { useMemberBillingByUserId } from "@/hooks/usePayments";
import { imageProfileURL } from "@/services/image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";

export default function BillingHistoryScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { id } = params;
  console.log("params", id);
  const router = useRouter();
  const { user, signOut } = useAuth();

  const {
    mutate: detailMemberByUserIdFn,
    data: detailMemberByUserId,
    isPending: isPendingDetailMember,
  } = useDetailMemberByUserId();
  const {
    mutate: memberPaymentBillingByUserIdFn,
    data: memberPaymentBillingData,
    isPending: isPendingMemberPayment,
  } = useMemberBillingByUserId();
  const user_personal = user.user_personal;

  useEffect(() => {
    async function getProgress() {
      await detailMemberByUserIdFn(id);
    }
    getProgress();
  }, []);
  useEffect(() => {
    async function getProgress() {
      await memberPaymentBillingByUserIdFn(id);
    }
    getProgress();
  }, []);
  if (isPendingMemberPayment || !detailMemberByUserId) {
    return <LoadingView />;
  }

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
        titleHeader="Riwayat Pembayaran"
        titleContent={detailMemberByUserId.user.name}
      >
        <View className="bg-white rounded-3xl p-6 shadow">
          <View className="items-center">
            {detailMemberByUserId.photo ? (
              <Image
                source={{ uri: imageProfileURL(detailMemberByUserId.photo) }}
                className="w-20 h-20 rounded-full border-4 border-white"
              />
            ) : (
              <View className="w-20 h-20 rounded-full bg-white justify-center items-center">
                <MaterialCommunityIcons
                  name="account"
                  size={42}
                  color="#6F3FA0"
                />
              </View>
            )}
            <Text weight="bold" className="text-2xl mt-4">
              {detailMemberByUserId.user.name}
            </Text>

            <View className="flex-row mt-2 items-center">
              <View className="bg-purple-100 px-3 py-1 rounded-full mr-2">
                <Text className="text-purple-700">Gold Member</Text>
              </View>

              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-700">Active</Text>
              </View>
            </View>

            <View className="flex-row mt-5">
              <View className="items-center mr-8">
                <Text className="text-gray-400">Join</Text>

                <Text weight="semibold">
                  {formatDate(detailMemberByUserId.created_at)}
                </Text>
              </View>

              <View className="items-center">
                <Text className="text-gray-400">Expired</Text>

                <Text weight="semibold">
                  {formatDate(detailMemberByUserId.joined)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <FlatListItem
          data={memberPaymentBillingData}
          keyExtractor={(item: any, index) =>
            item._id ? `${item._id}-${index}` : index.toString()
          }
          CustomComponent={BillsView}
          ListFooterComponent={() =>
            isPendingMemberPayment ? <ActivityIndicator /> : null
          }
          showsVerticalScrollIndicator={false}
          emptyMessage="Tagihan tidak ada"
        />
        <TouchableOpacity
          onPress={onDetail}
          // onPress={handleSubmit(onSubmit)}
          className="bg-purple-700 py-4 rounded-xl mt-4"
        >
          <Text className="text-white text-center font-bold">
            Lihat Informasi Pembayaran
          </Text>
        </TouchableOpacity>

        <View className="h-10" />
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
