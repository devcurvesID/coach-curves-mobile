import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDate } from "@/helpers/dates";
import { InformationRow } from "./information-components";
import type { MemberDetail } from "./types";
export function MemberPersonalInfo({ member }: { member: MemberDetail }) {
  return (
    <>
      <View className="mt-5 rounded-3xl border border-gray-100 bg-white px-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <View className="border-b border-gray-100 py-5 dark:border-zinc-800">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Informasi Pribadi
          </Text>
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Data identitas dan kontak member
          </Text>
        </View>
        <InformationRow
          icon="call-outline"
          label="Nomor Telepon"
          value={member.phone}
        />
        <InformationRow
          icon="phone-portrait-outline"
          label="Nomor Seluler"
          value={member.cellphone}
        />
        <InformationRow
          icon="calendar-outline"
          label="Tanggal Lahir"
          value={member.birth ? formatDate(member.birth) : null}
        />
        <InformationRow
          icon="location-outline"
          label="Alamat"
          value={member.address}
          lines={3}
        />
        <InformationRow
          icon="mail-outline"
          label="Kode Pos"
          value={member.postal}
        />
      </View>

      <View className="mt-5 flex-row items-center rounded-2xl bg-violet-50 p-4 dark:bg-violet-950">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-zinc-900">
          <Ionicons name="calendar" size={22} color="#6F3FA0" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Bergabung sejak
          </Text>
          <Text className="mt-1 font-bold text-[#6F3FA0] dark:text-violet-300">
            {member.joined ? formatDate(member.joined) : "Belum tersedia"}
          </Text>
        </View>
      </View>
    </>
  );
}
