import { useAuth } from "@/context/auth";
import { getDateTime } from "@/helpers/dates";
import { useMemberStatus } from "@/hooks/useMember";
import { useWorkoutHistory } from "@/hooks/useWorkout";
import { imageProfileURL } from "@/services/image";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
const { width, height } = Dimensions.get("window");
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) => (
  <View className="flex-row items-center justify-between py-3 border-b border-gray-200">
    <View className="flex-row items-center">
      <MaterialIcons name={icon} size={20} color="#7C3AED" />

      <Text className="ml-3 text-gray-500">{label}</Text>
    </View>

    <Text className="font-semibold text-gray-800" numberOfLines={1}>
      {value}
    </Text>
  </View>
);
export function InfoMemberCard() {
  const { user, isLoading } = useAuth();
  const [showDetail, setShowDetail] = useState(false);
  console.log("ss", user);
  const user_personal = user.user_personal;
  const {
    mutate: workoutHistoryFn,
    data: workoutHistory,
    isPending: isPendingWorkout,
  } = useWorkoutHistory();
  console.log("workoutHistory", workoutHistory);
  const { data: memberStatus, isLoading: isLoadingMemberStatus } =
    useMemberStatus();

  React.useEffect(() => {
    async function getWorkout() {
      let joined_year = new Date().getFullYear();
      let joined_month = new Date().getMonth();
      await workoutHistoryFn({ year: joined_year, month: joined_month });
    }
    getWorkout();
  }, []);
  console.log("memberStatusmemberStatus", memberStatus);

  const getMemberFlag = (workoutCount: number): any => {
    if (workoutCount >= 12) {
      return {
        flag: "A",
        color: "#22C55E",
        bg: "#DCFCE7",
        icon: "emoji-events",
      };
    }

    if (workoutCount >= 8) {
      return {
        flag: "B",
        color: "#84CC16",
        bg: "#ECFCCB",
        icon: "emoji-events",
      };
    }

    if (workoutCount >= 4) {
      return {
        flag: "C",
        color: "#EAB308",
        bg: "#FEF9C3",
        icon: "emoji-events",
      };
    }

    if (workoutCount >= 1) {
      return {
        flag: "D",
        color: "#F97316",
        bg: "#FFEDD5",
        icon: "emoji-events",
      };
    }

    return {
      flag: "E",
      color: "#EF4444",
      bg: "#FEE2E2",
      icon: "warning",
    };
  };
  const workoutCount: number = workoutHistory ? workoutHistory.total : 0;
  const memberFlag = getMemberFlag(workoutCount);

  if (isLoadingMemberStatus) {
    return <></>;
  }
  return (
    <View className="bg-white rounded-3xl p-5 mb-4 shadow">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Image
            source={{
              uri: imageProfileURL(user_personal.photo),
            }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
            }}
          />

          <View className="ml-4 flex-1">
            <Text className="text-xl font-bold text-gray-800" numberOfLines={1}>
              {user.name}
            </Text>

            <Text className="text-purple-600 font-semibold mt-1">
              {user_personal.key_tag_id}
            </Text>
          </View>
        </View>

        <View
          className={`px-4 py-2 rounded-full ${
            memberStatus.status === "Active" ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <Text
            className={`font-semibold ${
              memberStatus.status === "Active"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {memberStatus.status}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View className="h-[1px] bg-gray-100 my-5" />

      {/* Membership Info */}
      <View className="gap-4">
        <View
          className="rounded-2xl p-4"
          style={{
            backgroundColor: memberFlag.bg,
          }}
        >
          <View className="flex-row items-center">
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{
                backgroundColor: "#FFF",
              }}
            >
              <MaterialIcons
                name="emoji-events"
                size={24}
                color={memberFlag.color}
              />
            </View>

            <View className="ml-3 flex-1">
              <Text
                className="font-bold text-lg"
                style={{
                  color: memberFlag.color,
                }}
              >
                Flag {memberFlag.flag}
              </Text>

              <Text className="text-gray-600">
                {workoutCount} Workout Completed
              </Text>
            </View>
          </View>
        </View>
        {/* <View className="flex-row justify-between">
          <Text className="text-gray-500">👤 Tipe Member</Text>

          <Text className="font-semibold text-gray-800">
            Kategori {member.member_category}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-gray-500">🏷️ Keanggotaan</Text>

          <Text className="font-semibold text-gray-800">
            {member.membership_type}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-500">📅 Masa Aktif</Text>

          <Text className="font-semibold text-gray-800">
            {member.expired_at}
          </Text>
        </View> */}
      </View>

      {/* Action Button */}
      {/* <View className="flex-row gap-3 mt-6">
        <TouchableOpacity className="flex-1 bg-purple-600 py-3 rounded-2xl">
          <Text className="text-center text-white font-semibold">Detail</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 bg-blue-600 py-3 rounded-2xl">
          <Text className="text-center text-white font-semibold">
            Perpanjang
          </Text>
        </TouchableOpacity> 
      </View>*/}
      <View className="mt-5">
        <Animated.View layout={Layout.springify()}>
          {showDetail && (
            <Animated.View
              entering={FadeIn.duration(250)}
              exiting={FadeOut.duration(150)}
              className="bg-gray-50 rounded-2xl mt-4 p-4"
            >
              <Text className="font-bold text-gray-800 text-base mb-4">
                Informasi Member
              </Text>

              <InfoRow
                icon="person"
                label="Tipe"
                value={`${memberStatus.membership_type ? memberStatus.membership_type.membership_type_name : "Reguler Pre-Paid (12 Bulan)"}`}
              />

              <InfoRow
                icon="workspace-premium"
                label="Keanggotaan"
                value={memberFlag.flag}
              />

              <InfoRow
                icon="event"
                label="Masa Aktif"
                value={getDateTime(memberStatus.thru_date)}
              />

              <InfoRow
                icon="fitness-center"
                label="Workout"
                value={`${workoutCount} Sesi`}
              />

              <InfoRow
                icon="verified"
                label="Status"
                value={memberStatus.status}
              />
            </Animated.View>
          )}
        </Animated.View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowDetail(!showDetail)}
          className="bg-purple-600 py-3 rounded-2xl flex-row justify-center items-center"
        >
          <Text className="text-white font-bold mr-2">
            {showDetail ? "Tutup Detail" : "Detail"}
          </Text>

          <MaterialIcons
            name={showDetail ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={22}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
