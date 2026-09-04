import { FullscreenImage } from "@/components/ui/fullscreen-image";
import { getDateTime } from "@/helpers/dates";
import { getMemberFlag } from "@/helpers/member-flag";
import { useMemberCardData } from "@/hooks/useMember";
import { imageProfileURL } from "@/services/image";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";

interface InfoRowProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}

const DEFAULT_MEMBERSHIP_TYPE = "Reguler Pre-Paid (12 Bulan)";

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <View className="flex-row items-center justify-between border-b border-gray-200 py-3">
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
  const [showDetail, setShowDetail] = useState(false);
  const {
    displayStatus,
    isLoading,
    memberStatus,
    user,
    userPersonal,
    currentMonthWorkoutCount,
    totalWorkoutCount,
  } = useMemberCardData();
  const memberFlag = useMemo(
    () => getMemberFlag(currentMonthWorkoutCount),
    [currentMonthWorkoutCount],
  );

  if (isLoading || !user || !userPersonal || !memberStatus) {
    return null;
  }

  const isActive = displayStatus === "Active";
  const membershipType =
    memberStatus.membership_type?.membership_type_name ??
    DEFAULT_MEMBERSHIP_TYPE;

  return (
    <View className="mb-4 rounded-3xl bg-white p-5 shadow">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <FullscreenImage
            imageUrl={imageProfileURL(user.name, userPersonal.photo)}
            accessibilityLabel="Buka foto profil dalam layar penuh"
            thumbnailSize={70}
            thumbnail={
              <Image
                source={{ uri: imageProfileURL(user.name, userPersonal.photo) }}
                style={styles.profileImage}
              />
            }
          />
          <View className="ml-4 flex-1">
            <Text
              className="text-xl font-bold capitalize text-gray-800"
              numberOfLines={1}
            >
              {user.name}
            </Text>
            <Text className="mt-1 font-semibold text-purple-600">
              {userPersonal.key_tag_id}
            </Text>
          </View>
        </View>

        <View
          className={`rounded-full px-4 py-2 ${
            isActive ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <Text
            className={`font-semibold ${
              isActive ? "text-green-600" : "text-red-600"
            }`}
          >
            {displayStatus}
          </Text>
        </View>
      </View>

      <View className="my-5 h-px bg-gray-100" />

      <View className="gap-4">
        <View
          className="rounded-2xl p-4"
          style={{ backgroundColor: memberFlag.backgroundColor }}
        >
          <View className="flex-row items-center">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-white">
              <MaterialIcons
                name="emoji-events"
                size={24}
                color={memberFlag.color}
              />
            </View>
            <View className="ml-3 flex-1">
              <Text
                className="text-lg font-bold"
                style={{ color: memberFlag.color }}
              >
                Flag {memberFlag.flag}
              </Text>
              <Text className="text-gray-600">
                {currentMonthWorkoutCount} Workout Completed
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mt-5">
        <Animated.View layout={Layout.springify()}>
          {showDetail && (
            <Animated.View
              entering={FadeIn.duration(250)}
              exiting={FadeOut.duration(150)}
              className="mt-4 rounded-2xl bg-gray-50 p-4"
            >
              <Text className="mb-4 text-base font-bold text-gray-800">
                Informasi Member
              </Text>
              <InfoRow icon="person" label="Tipe" value={membershipType} />
              <InfoRow
                icon="workspace-premium"
                label="Keanggotaan"
                value={memberFlag.flag}
              />
              <InfoRow
                icon="event"
                label="Masa Aktif"
                value={getDateTime(new Date(memberStatus.thru_date))}
              />
              <InfoRow
                icon="fitness-center"
                label="Workout"
                value={`${totalWorkoutCount} Sesi`}
              />
              <InfoRow icon="verified" label="Status" value={displayStatus} />
            </Animated.View>
          )}
        </Animated.View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowDetail((currentValue) => !currentValue)}
          className="flex-row items-center justify-center rounded-2xl bg-purple-600 py-3"
        >
          <Text className="mr-2 font-bold text-white">
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

const styles = StyleSheet.create({
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
});
