import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { ActionTile } from "./information-components";
export function MemberActivities({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName: string;
}) {
  const router = useRouter();
  return (
    <>
      <View className="mb-1 mt-7">
        <Text className="text-xl font-bold text-gray-900 ">
          Aktivitas Member
        </Text>
        <Text className="mt-1 text-sm text-gray-500 ">
          Pilih informasi atau tindakan yang dibutuhkan
        </Text>
      </View>

      <View className="mt-4 flex-row flex-wrap justify-between">
        <ActionTile
          icon="barbell-outline"
          title="Workout"
          subtitle="Lihat riwayat workout"
          color="#6F3FA0"
          backgroundColor="#F3E8FF"
          onPress={() =>
            router.push({
              pathname: "/member-history/workout-history",
              params: { id: memberId },
            })
          }
        />
        <ActionTile
          icon="scale-outline"
          title="Weigh & Measure"
          subtitle="Lihat riwayat pengukuran"
          color="#0EA5E9"
          backgroundColor="#E0F2FE"
          onPress={() =>
            router.push({
              pathname: "/member-history/wm-history",
              params: { id: memberId },
            })
          }
        />
        {/* <ActionTile
            icon="add-circle-outline"
            title="Update WM"
            subtitle="Input pengukuran terbaru"
            color="#10B981"
            backgroundColor="#D1FAE5"
            onPress={() =>
              router.push({
                pathname: "/user/input-wm",
                params: { id: memberId },
              })
            }
          /> */}
        <ActionTile
          icon="wallet-outline"
          title="Pembayaran"
          subtitle="Lihat riwayat tagihan"
          color="#6366F1"
          backgroundColor="#E0E7FF"
          onPress={() =>
            router.push({
              pathname: "/member-history/billing-history",
              params: { id: memberId },
            })
          }
        />
        <ActionTile
          icon="trophy-outline"
          title="Challenges"
          subtitle="Lihat progres challenge"
          color="#F59E0B"
          backgroundColor="#FEF3C7"
          onPress={() =>
            router.push({
              pathname: "/list-member/member-challenges",
              params: { id: memberId, name: memberName },
            })
          }
        />
      </View>
    </>
  );
}
