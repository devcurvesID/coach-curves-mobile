import { LoadingView } from "@/components/ui/loading";
import { useClubs } from "@/hooks/useClubs";
import { clubImageURL } from "@/services/image";
import { openGoogleMaps } from "@/services/maps";
import { openWhatsApp } from "@/services/whatsapp";
import type { Club } from "@/types/club";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  FlatList,
  Image,
  ImageBackground,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TABLET_CONTENT_MAX_WIDTH } from "@/components/ui/adaptive-content";

const LIST_CONTENT_STYLE = {
  paddingHorizontal: 20,
  paddingTop: 12,
  paddingBottom: 150,
  width: "100%",
  maxWidth: TABLET_CONTENT_MAX_WIDTH,
  alignSelf: "center",
} as const;

const CommunityScreen = () => {
  const { data: clubs = [], error, isLoading } = useClubs();
  const [search, setSearch] = useState("");
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(24)).current;

  const gradientColors: [string, string] = ["#BB86FC", "#6F3FA0"];

  const filteredClubs = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return clubs;

    return clubs.filter((club) =>
      [club.club_name, club.club_code, club.city, club.province].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );
  }, [clubs, search]);

  const handleOpenMaps = useCallback(
    (club: Club): Promise<void> =>
      openGoogleMaps({
        placeName: club.club_name,
        address: club.address,
      }),
    [],
  );

  const handleContactClub = useCallback(
    (club: Club): Promise<void> =>
      openWhatsApp({
        phoneNumber: club.phones,
        message: `Halo, saya ingin mendapatkan informasi lebih lanjut mengenai ${club.club_name}.`,
        unavailableMessage: "Nomor WhatsApp club belum tersedia.",
      }),
    [],
  );

  const handleDetail = useCallback((club: Club): void => {
    router.push({
      pathname: "/club",
      params: { data: JSON.stringify(club) },
    });
  }, []);

  const renderClub: ListRenderItem<Club> = useCallback(
    ({ item }) => (
      <View className="mb-4 overflow-hidden rounded-3xl bg-white shadow">
        <Pressable onPress={() => handleDetail(item)}>
          <Image
            source={{ uri: clubImageURL(item.photo) }}
            style={styles.clubImage}
            resizeMode="cover"
          />
        </Pressable>

        <View className="absolute right-4 top-4">
          <View
            className={`mt-3 rounded-full px-3 py-1 ${
              item.status === "Active" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                item.status === "Active" ? "text-green-600" : "text-red-600"
              }`}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View className="p-4">
          <Text className="text-2xl font-bold capitalize text-gray-800">
            {item.club_name}
          </Text>
          <Text className="mt-1 text-lg font-bold text-purple-600">
            {item.club_code}
          </Text>
          <Text className="mt-3 text-gray-500">
            📍 {item.city}, {item.province}
          </Text>
          <Text className="mt-2 capitalize leading-6 text-gray-700">
            {item.address}
          </Text>

          <View className="mt-5 flex-row gap-3">
            <TouchableOpacity
              onPress={() => void handleContactClub(item)}
              className="flex-1 flex-row items-center justify-center rounded-2xl bg-purple-600 py-3"
            >
              <MaterialCommunityIcons
                name="whatsapp"
                size={20}
                color="#FFFFFF"
              />
              <Text className="ml-2 text-center text-base font-semibold text-white">
                WhatsApp
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => void handleOpenMaps(item)}
              className="flex-1 rounded-2xl bg-blue-600 py-3"
            >
              <Text className="text-center text-base font-semibold text-white">
                Maps
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ),
    [handleContactClub, handleDetail, handleOpenMaps],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnimation, slideAnimation]);

  if (isLoading) return <LoadingView />;

  return (
    <SafeAreaView style={styles.screen}>
      <ImageBackground
        source={require("@/assets/images/bgcurveslightnew.png")}
        resizeMode="cover"
        style={StyleSheet.absoluteFillObject}
      />

      <View pointerEvents="none" style={styles.gradientHeader}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <Animated.View
        style={[
          styles.listContainer,
          {
            opacity: fadeAnimation,
            transform: [{ translateY: slideAnimation }],
          },
        ]}
      >
        <View style={styles.searchSection}>
          <View style={styles.searchContent}>
            <View className="flex-row items-center rounded-2xl border border-purple-100 bg-white px-4 shadow-sm">
              <Ionicons name="search-outline" size={21} color="#6F3FA0" />
              <TextInput
                accessibilityLabel="Cari lokasi club"
                placeholder="Cari club, kota, kode club..."
                placeholderTextColor="#94A3B8"
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                className="ml-3 flex-1 py-4 text-base text-slate-800"
              />
              {search.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Hapus pencarian lokasi"
                  hitSlop={10}
                  onPress={() => setSearch("")}
                >
                  <Ionicons name="close-circle" size={21} color="#94A3B8" />
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>

        <FlatList
          style={styles.clubList}
          data={filteredClubs}
          keyExtractor={(item) => item._id}
          renderItem={renderClub}
          ListEmptyComponent={
            <View className="items-center px-6 py-16">
              <Text className="text-center text-base text-slate-500">
                {error
                  ? "Gagal memuat data club."
                  : search
                    ? "Club yang dicari tidak ditemukan."
                    : "Belum ada data club."}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={LIST_CONTENT_STYLE}
          keyboardShouldPersistTaps="handled"
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  gradientHeader: {
    position: "absolute",
    top: -96,
    left: 0,
    right: 0,
    height: 320,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    overflow: "hidden",
  },
  listContainer: {
    flex: 1,
  },
  clubList: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
    zIndex: 10,
  },
  searchContent: {
    width: "100%",
    maxWidth: TABLET_CONTENT_MAX_WIDTH,
    alignSelf: "center",
  },
  clubImage: {
    width: "100%",
    height: 180,
  },
});

export default CommunityScreen;
