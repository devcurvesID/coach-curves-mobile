import ContainerPage from "@/components/ui/container-page";
import { FullscreenImage } from "@/components/ui/fullscreen-image";
import { PublicityNote } from "@/components/publicities/publicity-note";
import { publicityImageURL } from "@/services/image";
import type { Publicity } from "@/types/publicity";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";

export default function DetailPublicityScreen() {
  const params = useLocalSearchParams<{ data: string }>();
  const promo = JSON.parse(params.data) as Publicity;

  return (
    <>
      <ContainerPage titleHeader={promo.headline} titleContent="Detail Promo">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName=" pt-5 pb-32"
          showsVerticalScrollIndicator={false}
        >
          {/* Banner */}
          <FullscreenImage
            imageUrl={publicityImageURL(promo.photo)}
            accessibilityLabel="Buka gambar promo dalam layar penuh"
            status="PROMO"
          />
          {/* <View>
            <Image
              source={{
                uri: publicityImageURL(promo.photo),
              }}
              style={{
                width: "100%",
                height: 800,
              }}
              resizeMode="cover"
            />

            <View className="absolute top-14 right-5 bg-pink-500 px-4 py-2 rounded-full">
              <Text className="text-white font-bold">PROMO</Text>
            </View>
          </View> */}

          {/* Content */}
          <View className="bg-white rounded-t-[35px] mt-8 p-6">
            {/* Title */}
            <Text className="text-3xl font-bold text-gray-800">
              {promo.headline}
            </Text>

            {/* Date */}
            <View className="flex-row items-center mt-4">
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />

              <Text className="ml-2 text-gray-500">
                {dayjs(promo.from_date).format("DD MMM YYYY")}
                {" - "}
                {dayjs(promo.thru_date).format("DD MMM YYYY")}
              </Text>
            </View>

            {/* Status */}
            <View className="mt-4 self-start bg-green-100 px-4 py-2 rounded-full">
              <Text className="text-green-700 font-semibold">
                ACTIVE PROMOTION
              </Text>
            </View>

            {promo.note && (
              <View className="mt-8">
                <Text className="text-xl font-bold text-gray-800 mb-4">
                  About Promotion
                </Text>
                <PublicityNote html={promo.note} />
              </View>
            )}
            {/* Description */}

            {/* Benefits */}
            {/* <View className="mt-8">
              <Text className="text-xl font-bold text-gray-800 mb-4">
                Promotion Benefits
              </Text>

              <View className="bg-purple-50 rounded-3xl p-5">
                <View className="flex-row items-center mb-4">
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={22}
                    color="#6F3FA0"
                  />

                  <Text className="ml-3 text-gray-700">
                    Special Membership Discount
                  </Text>
                </View>

                <View className="flex-row items-center mb-4">
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={22}
                    color="#6F3FA0"
                  />

                  <Text className="ml-3 text-gray-700">
                    Free Body Measurement
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={22}
                    color="#6F3FA0"
                  />

                  <Text className="ml-3 text-gray-700">
                    Exclusive Merchandise
                  </Text>
                </View>
              </View>
            </View> */}

            {/* Terms */}
            {/* <View className="mt-8">
              <Text className="text-xl font-bold text-gray-800 mb-4">
                Terms & Conditions
              </Text>

              <View className="bg-gray-50 rounded-3xl p-5">
                <Text className="text-gray-600 mb-3">
                  • Promo berlaku untuk member aktif.
                </Text>

                <Text className="text-gray-600 mb-3">
                  • Promo hanya berlaku selama periode promo.
                </Text>

                <Text className="text-gray-600">
                  • Tidak dapat digabung dengan promo lain.
                </Text>
              </View>
            </View> */}

            {/* Contact */}
            {/* <View className="mt-8">
              <Text className="text-xl font-bold text-gray-800 mb-4">
                Need Help?
              </Text>

              <View className="bg-blue-50 rounded-3xl p-5">
                <View className="flex-row items-center">
                  <Ionicons name="call-outline" size={22} color="#2563EB" />

                  <Text className="ml-3 text-blue-700 font-medium">
                    Contact Your Curves Club
                  </Text>
                </View>
              </View>
            </View> */}

            {/* Button */}
            {/* <TouchableOpacity className="bg-purple-600 py-4 rounded-2xl mt-8 mb-10">
              <Text className="text-center text-white font-bold text-lg">
                Claim Promotion
              </Text>
            </TouchableOpacity> */}
          </View>
        </ScrollView>
      </ContainerPage>
    </>
  );
}
