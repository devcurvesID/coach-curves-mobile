import { LoadingView } from "@/components/ui/loading";
import { useAuth } from "@/context/auth";
import { useClubs } from "@/hooks/useClubs";
import { PATH_PUBLIC_IMAGE_CLUB } from "@/utils/constants";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const { width, height } = Dimensions.get("window");

const ComunityScreen = () => {
  const { user, isLoading } = useAuth();
  console.log("ss", user);
  const { data: clubs, isLoading: isLoadingClub } = useClubs();

  const [search, setSearch] = React.useState("");

  const openMaps = (item: any) => {
    const query = encodeURIComponent(`${item.club_name} ${item.address}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);

    // Linking.openURL("https://maps.app.goo.gl/75vfLq3Yc5dEkToB8");

    // if (item.latitude && item.longitude) {

    //   Linking.openURL("https://maps.app.goo.gl/75vfLq3Yc5dEkToB8");
    // }
  };

  const imageChallengeURL = (fileName?: string) => {
    if (!fileName) {
      return "https://placehold.co/600x400/png";
    }
    return `${PATH_PUBLIC_IMAGE_CLUB}/${fileName}`;
  };

  const callClub = (phone: number) => {
    console.log("dd", phone);

    Linking.openURL(`tel:${phone}`);
  };
  const onDetail = (wm: any) => {
    router.push({
      pathname: "/club",
      params: { data: JSON.stringify(wm) }, //{ ...data, bank: { ...data.bank } },
    });
  };

  const filteredData = React.useMemo(() => {
    if (!search) return clubs;

    return clubs.filter((item: any) => {
      const keyword = search.toLowerCase();

      return (
        item.club_name.toLowerCase().includes(keyword) ||
        item.club_code.toLowerCase().includes(keyword) ||
        item.city.toLowerCase().includes(keyword) ||
        item.province.toLowerCase().includes(keyword)
      );
    });
  }, [search]);

  const renderItem = ({ item }: any) => (
    <View className="bg-white rounded-3xl mb-4 overflow-hidden shadow">
      {/* Hero Image */}
      <Pressable onPress={() => onDetail(item)}>
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
      </Pressable>

      {/* Badge Active */}
      <View className="absolute top-4 right-4">
        <View
          className={`px-3 py-1 mt-3 rounded-full ${
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

      {/* Content */}
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 capitalize">
          {item.club_name}
        </Text>

        <Text className="text-purple-600 font-bold text-lg mt-1">
          {item.club_code}
        </Text>

        <Text className="mt-3 text-gray-500">
          📍 {item.city}, {item.province}
        </Text>

        <Text className="mt-2 text-gray-700 capitalize leading-6">
          {item.address}
        </Text>

        <View className="flex-row mt-5 gap-3">
          <TouchableOpacity
            onPress={() => callClub(item.phones)}
            className="flex-1 bg-purple-600 rounded-2xl py-3"
          >
            <Text className="text-center text-white font-semibold text-base">
              Call
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openMaps(item)}
            className="flex-1 bg-blue-600 rounded-2xl py-3"
          >
            <Text className="text-center text-white font-semibold text-base">
              Maps
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const { colorScheme } = useColorScheme(); // "light" | "dark"

  const colors = React.useMemo<[string, string]>(() => {
    if (colorScheme == "dark") {
      return ["#6F3FA0", "#BB86FC"];
    }
    return ["#BB86FC", "#6F3FA0"];
  }, [colorScheme]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (isLoadingClub) {
    return <LoadingView />;
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ImageBackground
        source={require("@/assets/images/bgcurveslightnew.png")}
        resizeMode="cover"
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header Gradient */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -96,
          left: 0,
          right: 0,
          height: 320,
          borderBottomLeftRadius: 60,
          borderBottomRightRadius: 60,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={colors}
          // colors={["#9C27B0", "#E91E63", "#FF6090"]}
          start={{ x: 0.1, y: 0.0 }}
          end={{ x: 0.9, y: 1.0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          // paddingTop: 24,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* ── HEADER ── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          ></View>

          {/* ── PROFILE CARD ── */}
          {/* <ProfileCardView /> */}

          {/* <InformationWorkOutView /> */}

          <TextInput
            placeholder="Cari club, kota, kode club..."
            value={search}
            onChangeText={setSearch}
            className="bg-white rounded-2xl px-4 py-4 mb-4 border border-gray-200"
          />

          <FlatList
            data={filteredData ? filteredData : clubs}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 150,
            }}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ComunityScreen;
