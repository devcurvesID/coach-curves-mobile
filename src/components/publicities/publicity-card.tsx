import { PATH_PUBLIC_IMAGE_PUBLICITY } from "@/utils/constants";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export function PublicityCard({
  item,
  onPress,
}: {
  item: any;
  onPress?: () => void;
}) {
  const imageChallengeURL = (fileName?: string) => {
    if (!fileName) {
      return "https://placehold.co/600x400/png";
    }
    return `${PATH_PUBLIC_IMAGE_PUBLICITY}/${fileName}`;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="bg-white rounded-3xl mb-5 overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      {/* Banner */}
      <View>
        <Image
          source={{
            uri: imageChallengeURL(item.photo),
          }}
          style={{
            width: "100%",
            height: 180,
          }}
          resizeMode="cover"
        />

        <View className="absolute top-4 right-4 bg-pink-500 px-3 py-2 rounded-full">
          <Text className="text-white text-xs font-bold">PROMO</Text>
        </View>
      </View>

      <View className="p-5">
        {/* Title */}
        <Text className="text-xl font-bold text-gray-800" numberOfLines={2}>
          {item.headline}
        </Text>

        {/* Date */}
        <View className="flex-row items-center mt-3">
          <Ionicons name="calendar-outline" size={18} color="#6B7280" />

          <Text className="ml-2 text-gray-500">
            {dayjs(item.from_date).format("DD MMM YYYY")}
            {" - "}
            {dayjs(item.thru_date).format("DD MMM YYYY")}
          </Text>
        </View>

        {/* Note */}
        <Text className="text-gray-600 mt-4 leading-6" numberOfLines={3}>
          {item.note}
        </Text>

        {/* Footer */}
        <View className="flex-row justify-between items-center mt-5">
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="tag-heart"
              size={18}
              color="#9333EA"
            />

            <Text className="text-purple-600 font-semibold ml-2">
              Special Promotion
            </Text>
          </View>

          <View
            className={`px-3 py-1 rounded-full ${
              item.status === "publish" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                item.status === "publish" ? "text-green-700" : "text-red-700"
              }`}
            >
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity className="bg-purple-600 py-3 rounded-2xl mt-5">
          <Text className="text-center text-white font-semibold">
            Lihat Promo
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
