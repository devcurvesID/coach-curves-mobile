import { PublicityCard } from "@/components/publicities/publicity-card";
import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import { useAuth } from "@/context/auth";
import { usePublicities } from "@/hooks/usePublicities";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, TextInput, View } from "react-native";

export default function PublicityScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: promos, isLoading: isLoadingPromo } = usePublicities();
  const [search, setSearch] = useState("");
  const onDetail = (wm: any) => {
    router.push({
      pathname: "/publicities/detail",
      params: { data: JSON.stringify(wm) }, //{ ...data, bank: { ...data.bank } },
    });
  };
  const filteredData = React.useMemo(() => {
    if (!search) return promos;

    return promos.filter((item: any) => {
      const keyword = search.toLowerCase();

      return (
        item.challenge.toLowerCase().includes(keyword) ||
        item.type.toLowerCase().includes(keyword)
      );
    });
  }, [search]);
  // 🔥 generate bulan (dinamis)
  if (isLoadingPromo) {
    return <LoadingView />;
  }
  return (
    <>
      <ContainerPage titleHeader="Promo" titleContent="Promo">
        {/* <View className="bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-3xl p-6 mx-5 mb-5">
          <Text className="text-white text-2xl font-bold">Promo Terbaru</Text>

          <Text className="text-purple-100 mt-2">
            Jangan lewatkan promo spesial untuk member Curves
          </Text>

          <View className="flex-row justify-between mt-6">
            <View>
              <Text className="text-white text-3xl font-bold">
                {promos.length}
              </Text>
              <Text className="text-purple-100">Promo Aktif</Text>
            </View>

            <MaterialCommunityIcons name="sale" size={50} color="white" />
          </View>
        </View> */}

        <View className="mx-5 mt-4 mb-2">
          <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-100">
            <Ionicons name="search-outline" size={22} color="#9CA3AF" />

            <TextInput
              placeholder="Cari promo..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              className="flex-1 ml-3 text-base text-gray-800"
            />
          </View>
        </View>
        <FlatList
          data={filteredData ? filteredData : promos}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 15,
            paddingBottom: 120,
          }}
          renderItem={({ item }) => (
            <PublicityCard item={item} onPress={() => onDetail(item)} />
          )}
        />
        {/* <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-2 pt-5 pb-32"
          showsVerticalScrollIndicator={false}
        ></ScrollView> */}
      </ContainerPage>
    </>
  );
}
