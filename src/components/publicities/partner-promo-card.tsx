import { formatShortDate } from "@/helpers/dates";
import { openGoogleMaps } from "@/services/maps";
import { openWhatsApp } from "@/services/whatsapp";
import type { PartnerPromo } from "@/types/publicity";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

const PURPLE = "#9333EA";
interface PartnerPromoCardProps {
  item: PartnerPromo;
}

const PartnerPromoCard = ({ item }: PartnerPromoCardProps) => {
  const isActive = item.status === "active";

  const handleCall = (): Promise<void> =>
    openWhatsApp({
      phoneNumber: item.phone_number,
      message: `Halo, saya ingin mendapatkan informasi lebih lanjut mengenai promo ${item.cp_name}.`,
      unavailableMessage: "Nomor WhatsApp mitra belum tersedia.",
    });

  const handleLocation = (): Promise<void> =>
    openGoogleMaps({
      placeName: item.cp_name,
      address: item.address,
    });

  return (
    <View className="mb-6 overflow-hidden rounded-[28px] border border-purple-100 bg-white">
      {/* Header */}
      <View className="bg-purple-50 px-5 pb-5 pt-5">
        <View className="flex-row items-start justify-between">
          <View className="mr-3 h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-600">
            <MaterialCommunityIcons
              name="storefront-outline"
              size={29}
              color="#FFFFFF"
            />
          </View>

          <View className="flex-row items-center rounded-full bg-white px-3 py-2">
            <View
              className={[
                "mr-2 h-2 w-2 rounded-full",
                isActive ? "bg-green-500" : "bg-gray-400",
              ].join(" ")}
            />

            <Text
              className={[
                "text-xs font-bold uppercase tracking-wide",
                isActive ? "text-green-600" : "text-gray-500",
              ].join(" ")}
            >
              {isActive ? "Aktif" : "Tidak aktif"}
            </Text>
          </View>
        </View>

        <Text
          numberOfLines={2}
          className="mt-4 text-[21px] font-bold leading-7 text-slate-900"
        >
          {item.cp_name}
        </Text>

        <View className="mt-2 flex-row items-center">
          <Ionicons name="person-outline" size={17} color="#64748B" />

          <Text
            numberOfLines={1}
            className="ml-2 flex-1 text-sm text-slate-500"
          >
            PIC: {item.pic_name}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="px-5 pb-5 pt-5">
        <View className="rounded-[22px] bg-[#F8F3FF] px-5 py-5">
          <View className="flex-row items-start">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100">
              <Ionicons name="pricetag-outline" size={21} color={PURPLE} />
            </View>

            <Text className="ml-3 flex-1 text-[16px] font-semibold leading-6 text-slate-800">
              {item.message}
            </Text>
          </View>
        </View>

        <View className="mt-5">
          <View className="flex-row items-start">
            <View className="mt-0.5 h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50">
              <Ionicons name="location-outline" size={19} color="#64748B" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-xs text-slate-400">Lokasi</Text>

              <Text className="mt-1 text-[15px] leading-5 text-slate-700">
                {item.address}
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-start">
            <View className="mt-0.5 h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50">
              <Ionicons name="calendar-outline" size={19} color="#64748B" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-xs text-slate-400">Periode promo</Text>

              <Text className="mt-1 text-[15px] font-semibold text-slate-700">
                {formatShortDate(item.from_date)} -{" "}
                {formatShortDate(item.thru_date)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 flex-row gap-3">
          <Pressable
            onPress={() => {
              void handleCall();
            }}
            className="h-14 flex-1 flex-row items-center justify-center rounded-2xl bg-purple-600 active:bg-purple-700"
          >
            <MaterialCommunityIcons name="whatsapp" size={22} color="#FFFFFF" />

            <Text className="ml-2 text-base font-bold text-white">
              WhatsApp
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              void handleLocation();
            }}
            className="h-14 flex-1 flex-row items-center justify-center rounded-2xl border border-purple-200 bg-purple-50 active:bg-purple-100"
          >
            <Ionicons name="map-outline" size={21} color={PURPLE} />

            <Text className="ml-2 text-base font-bold text-purple-600">
              Lokasi
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default PartnerPromoCard;
