import ContainerPage from "@/components/ui/container-page";
import { FlatListItem } from "@/components/ui/flat-list-item";
import { LoadingView } from "@/components/ui/loading";
import { formatCurrency, getDateTime } from "@/helpers/dates";
import { useMemberBill, useMemberBilling } from "@/hooks/usePayments";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BillsScreen() {
  const router = useRouter();
  const {
    data: memberBilling,
    isLoading: isLoadingMemberBilling,
    //   error,
    //   refetch,
  } = useMemberBilling();
  const { data: memberBill, isLoading: isLoadingBill } = useMemberBill();

  const onSubmit = (data: any) => {
    console.log("SUBMIT:", data);
    // 🔥 call API di sini
  };

  if (isLoadingMemberBilling || isLoadingBill) {
    return <LoadingView />;
  }
  const onDetail = () => {
    router.push("/user/details-bill");
  };
  console.log("memberBill", memberBill);

  return (
    <ContainerPage
      titleHeader="Tagihan Member"
      titleContent="Lihat tagihan member"
    >
      {/* SUMMARY */}
      <View className="flex-row justify-between mb-5">
        <View className="flex-1 bg-white rounded-3xl p-4 mr-2">
          <Text className="text-gray-400 text-xs">Total Tagihan</Text>

          <Text className="text-sm font-bold text-[#6F3FA0] mt-2">
            {formatCurrency(memberBill.total_bill_amount)}
          </Text>
        </View>

        <View className="flex-1 bg-white rounded-3xl p-4 ml-2">
          <Text className="text-gray-400 text-xs">Sudah Dibayar</Text>

          <Text className="text-sm font-bold text-green-600 mt-2">
            {formatCurrency(memberBill.total_amount_paid)}
          </Text>
        </View>

        <View className="flex-1 bg-white rounded-3xl p-4 mr-2">
          <Text className="text-gray-400 text-xs">Sisa Tagihan</Text>

          <Text className="text-sm font-bold text-[#F43F5E] mt-2">
            {formatCurrency(memberBill.rest_of_bill)}
          </Text>
        </View>
      </View>

      {/* TITLE */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-bold text-gray-800">
          Riwayat Pembayaran
        </Text>

        <Text className="text-sm text-[#6F3FA0]">
          {memberBilling.length} pembayaran
        </Text>
      </View>
      <FlatListItem
        data={memberBilling}
        keyExtractor={(item: any, index) =>
          item._id ? `${item._id}-${index}` : index.toString()
        }
        CustomComponent={BillsView}
        ListFooterComponent={() =>
          isLoadingMemberBilling ? <ActivityIndicator /> : null
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
