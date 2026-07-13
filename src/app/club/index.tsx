import ContainerPage from "@/components/ui/container-page";
import { useAuth } from "@/context/auth";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function InformationClubScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const item = JSON.parse(params.data as string);
  console.log("detail club", item);
  const { user, signOut } = useAuth();

  const user_personal = user.user_personal;

  // 🔥 generate bulan (dinamis)

  const formatPhoneNumber = (phone: string) => {
    let cleaned = phone.replace(/\D/g, "");

    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.slice(1);
    }

    return cleaned;
  };

  const callClub = () => {
    if (item.phones) {
      const phone = formatPhoneNumber(item.phones);
      Linking.openURL(
        `https://wa.me/${phone}?text=${encodeURIComponent(
          "Halo, saya ingin mendapatkan informasi lebih lanjut.",
        )}`,
      );
    }
  };

  const openMaps = () => {
    const query = encodeURIComponent(`${item.club_name} ${item.address}`);

    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <>
      <ContainerPage titleHeader={item.club_name} titleContent="Informasi Club">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-2 pt-5 pb-32"
          showsVerticalScrollIndicator={false}
        >
          {/* Cover */}
          <Image
            source={{
              uri:
                item.image ||
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
            }}
            style={{
              width: "100%",
              height: 280,
            }}
            // contentFit="cover"
          />

          <View className="p-5">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-3xl font-bold text-gray-900 capitalize">
                  {item.club_name}
                </Text>

                <Text className="text-purple-600 font-bold text-xl mt-2">
                  {item.club_code}
                </Text>
              </View>

              <View className="bg-green-100 px-4 py-2 rounded-full">
                <Text className="text-green-700 font-semibold">
                  {item.status}
                </Text>
              </View>
            </View>

            {/* Informasi */}
            <View className="mt-8 gap-5">
              <InfoItem label="Alamat" value={item.address} />

              <InfoItem label="Kota" value={item.city} />

              <InfoItem label="Provinsi" value={item.province} />

              <InfoItem label="Negara" value={item.country} />

              <InfoItem label="Kode Pos" value={item.postal} />

              <InfoItem label="Telepon" value={item.phones} />

              <InfoItem label="Email" value={item.email} />

              <InfoItem label="Facebook" value={item.facebook} />

              <InfoItem
                label="Digital Product"
                value={item.digital_product ? "Yes" : "No"}
              />

              <InfoItem label="HQ" value={item.hq ? "Yes" : "No"} />

              <InfoItem
                label="Created"
                value={new Date(item.created_at).toLocaleDateString()}
              />

              <InfoItem
                label="Updated"
                value={new Date(item.updated_at).toLocaleDateString()}
              />
            </View>

            {/* Action */}
            <View className="flex-row gap-3 mt-8 mb-10">
              <TouchableOpacity
                onPress={callClub}
                className="flex-1 bg-purple-600 py-4 rounded-2xl"
              >
                <Text className="text-center text-white font-bold">
                  Call Club
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openMaps}
                className="flex-1 bg-blue-600 py-4 rounded-2xl"
              >
                <Text className="text-center text-white font-bold">
                  Open Maps
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ContainerPage>
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: any }) {
  return (
    <View className="border-b border-gray-100 pb-3">
      <Text className="text-gray-400 text-sm">{label}</Text>

      <Text className="text-gray-800 text-base mt-1 capitalize">
        {value || "-"}
      </Text>
    </View>
  );
}
