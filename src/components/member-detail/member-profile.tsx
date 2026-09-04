import React from "react";
import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FullscreenImage } from "@/components/ui/fullscreen-image";
import { imageProfileURL } from "@/services/image";
import { getMemberFlagStyle } from "@/helpers/member-flag";
import moment from "moment";
import { getInitials, displayValue, getTshirtSize } from "./formatters";
import type { MemberDetail } from "./types";
interface ChallengeSummary {
  challenges_progress?: number;
  total_workout?: number;
  challenges_complete?: number;
}
export function MemberProfile({
  member,
  challengeSummary,
  isLoadingChallengeSummary,
}: {
  member: MemberDetail;
  challengeSummary?: ChallengeSummary | null;
  isLoadingChallengeSummary: boolean;
}) {
  const memberFlagStyle = getMemberFlagStyle(member.flag);
  const joinedDate = member.joined
    ? moment(member.joined).startOf("day")
    : null;
  const daysSinceJoining =
    joinedDate?.isValid() === true
      ? moment().startOf("day").diff(joinedDate, "days")
      : null;
  const isNewMember =
    daysSinceJoining !== null && daysSinceJoining >= 0 && daysSinceJoining < 30;

  return (
    <View className="overflow-hidden rounded-3xl bg-[#6F3FA0] shadow-sm">
      <View className="items-center px-5 py-7">
        {member.photo ? (
          <FullscreenImage
            imageUrl={imageProfileURL(member.photo)}
            accessibilityLabel={`Buka foto profil ${member.user.name} dalam layar penuh`}
            thumbnailSize={96}
            thumbnailIndicatorPosition="bottom-right"
            thumbnail={
              <Image
                source={{ uri: imageProfileURL(member.photo) }}
                className="h-24 w-24 rounded-3xl border-4 border-white/30 bg-violet-100"
              />
            }
          />
        ) : (
          <View className="h-24 w-24 items-center justify-center rounded-3xl border-4 border-white/30 bg-white">
            <Text className="text-2xl font-bold text-[#6F3FA0]">
              {getInitials(member.user.name)}
            </Text>
          </View>
        )}

        <Text className="mt-4 text-center text-2xl font-bold text-white">
          {member.user.name}
        </Text>
        <Text className="mt-1 text-center text-sm text-violet-200">
          {displayValue(member.user.email)}
        </Text>

        {(member.flag || isNewMember) && (
          <View className="mt-4 flex-row flex-wrap items-center justify-center gap-2">
            {member.flag && (
              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: memberFlagStyle.backgroundColor }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: memberFlagStyle.color }}
                >
                  Flag {member.flag.toUpperCase()}
                </Text>
              </View>
            )}
            {isNewMember && (
              <View
                accessibilityLabel={`Member baru, bergabung ${daysSinceJoining === 0 ? "hari ini" : `${daysSinceJoining} hari lalu`}`}
                className="flex-row items-center rounded-full bg-pink-100 px-3 py-1.5"
              >
                <Ionicons name="sparkles" size={14} color="#DB2777" />
                <Text className="ml-1.5 text-xs font-bold text-pink-700">
                  Member Baru
                </Text>
              </View>
            )}
          </View>
        )}

        {isLoadingChallengeSummary ? (
          <View className="mt-5 flex-row items-center">
            <Ionicons name="sync-outline" size={16} color="#DDD6FE" />
            <Text className="ml-2 text-xs text-violet-200">
              Memuat informasi challenge...
            </Text>
          </View>
        ) : challengeSummary ? (
          <View className="mt-5 w-full flex-row rounded-2xl bg-black/10 px-3 py-4">
            <View className="flex-1 items-center border-r border-white/20">
              <Text className="text-xl font-bold text-white">
                {challengeSummary.challenges_progress ?? 0}
              </Text>
              <Text className="mt-1 text-[10px] text-violet-200">Berjalan</Text>
            </View>
            <View className="flex-1 items-center border-r border-white/20">
              <Text className="text-xl font-bold text-white">
                {challengeSummary.total_workout ?? 0}
              </Text>
              <Text className="mt-1 text-[10px] text-violet-200">Workout</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-white">
                {challengeSummary.challenges_complete ?? 0}
              </Text>
              <Text className="mt-1 text-[10px] text-violet-200">Selesai</Text>
            </View>
          </View>
        ) : null}
      </View>

      <View className="flex-row bg-black/10 px-5 py-4">
        <View className="flex-1 items-center border-r border-white/20">
          <Text className="text-xs text-violet-200">KEY TAG</Text>
          <Text className="mt-1 font-bold text-white">
            {displayValue(member.key_tag_id)}
          </Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-xs text-violet-200">T-SHIRT</Text>
          <Text className="mt-1 font-bold text-white">
            {getTshirtSize(member.tshirt_size)}
          </Text>
        </View>
      </View>
    </View>
  );
}
