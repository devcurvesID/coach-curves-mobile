//
import { InfoMemberCard } from "@/components/profile/info-member";
import MenuTile from "@/components/ui/menu-tile";
import Text from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { formatDate } from "@/helpers/dates";
import { usePublicities } from "@/hooks/usePublicities";
import { socket } from "@/services/socket";
import { PATH_PUBLIC_IMAGE_PUBLICITY } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const { width, height } = Dimensions.get("window");

const DashboardScreen = () => {
  const { t } = useTranslation();
  console.log(t("home.title"));

  const { colorScheme } = useColorScheme(); // "light" | "dark"
  const { user, isLoading } = useAuth();
  console.log("ss", user);
  const user_personal = user.user_personal;
  const { data: promos, isLoading: isLoadingPromo } = usePublicities();

  React.useEffect(() => {
    console.log("(socket.connected", socket.connected);
    socket.emit("user-curves", `${user._id}_${user.source_id}`);

    // if (socket.connected) {
    //   console.log("connect success");
    // }
    // socket.on("message", (data) => {
    //   console.log(data);
    // });

    // socket.emit("user-curves", `user_${user.source_id}`);

    // socket.on("notification", (data) => {
    //   console.log("notiff=> ", data);
    // });
    // return () => {
    //   socket.off("notification");
    // };

    // return () => {
    //   socket.off("message");
    // };
  }, []);
  const colors = React.useMemo<[string, string]>(() => {
    if (colorScheme == "dark") {
      return ["#6F3FA0", "#BB86FC"];
    }
    return ["#BB86FC", "#6F3FA0"];
  }, [colorScheme]);

  const onDetail = (wm: any) => {
    router.push({
      pathname: "/publicities/detail",
      params: { data: JSON.stringify(wm) }, //{ ...data, bank: { ...data.bank } },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFFFFF] dark:bg-[#121212]">
      <ImageBackground
        source={require("@/assets/images/bgcurveslightnew.png")}
        resizeMode="cover"
        className="absolute inset-0"
      />
      <View
        pointerEvents="none"
        className="absolute -top-24 left-0 right-0 h-[320px] rounded-b-[60px] overflow-hidden"
        // className="absolute -top-24 left-0 right-0 h-96 rounded-b-[60px] overflow-hidden"
        style={{
          backgroundColor: "transparent",
          shadowColor: "#000",
        }}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0.1, y: 0.0 }}
          end={{ x: 0.9, y: 1.0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-8 pb-40"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        {/* <View className="flex-row items-start justify-between">
          <View>
            <Text
              variant="title"
              weight="bold"
              className="text-[#FFFFFF] dark:text-[#FFFFFF] text-4xl font-extrabold tracking-tight"
            >
              Hi, {user.name}
            </Text>
            <Text
              variant="subtitle"
              weight="medium"
              className="text-[#FFFFFF] dark:text-[#FFFFFF] text-base mt-2"
            >
              Ready to crush your workout? 💪
            </Text>
          </View>

          <Pressable className="mt-2">
            <View style={{ position: "relative" }}>
              <View
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 38,
                  padding: 3,
                  backgroundColor: "transparent",
                  borderWidth: 3,
                  borderColor: "#D6B36A",
                }}
              >
                <Image
                  source={{
                    uri: imageProfileURL(user_personal.photo),
                  }}
                  style={{ width: "100%", height: "100%", borderRadius: 36 }}
                />
              </View>
              <View
                style={{
                  position: "absolute",
                  bottom: 2,
                  right: 2,
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: "#4ADE80",
                  borderWidth: 2,
                  borderColor: "#FFFFFF",
                }}
              />
            </View>
          </Pressable>

   
        </View> */}
        {/* <Divider /> */}
        <InfoMemberCard />

        <View className="pt-5">
          {/* <SectionTitle>Your Weekly Progress</SectionTitle> */}
          <View className="flex-row gap-4">
            <MenuTile
              onPress={() => router.push("/user/weigh-measure")}
              title={`Weigh & \rMeasure`}
              icon={<Ionicons name="calendar" size={22} color="#F8BBD0" />}
            />
            <MenuTile
              onPress={() => router.push("/user/bills")}
              title="Payment Histori"
              icon={<Ionicons name="bar-chart" size={22} color="#F8BBD0" />}
            />
          </View>
          <View className="flex-row gap-4 mt-4">
            <MenuTile
              onPress={() => router.push("/challenges")}
              title="Challenge"
              icon={<Ionicons name="barbell" size={22} color="#F8BBD0" />}
            />
            <MenuTile
              onPress={() => router.push("/user/attendance")}
              title="Workout History"
              icon={<Ionicons name="bar-chart" size={22} color="#F8BBD0" />}
            />
          </View>

          {/* <View className="flex-row gap-4 mt-4">
            <MenuTile
              title="Laporan"
              icon={<Ionicons name="bar-chart" size={22} color="#F8BBD0" />}
            />
            <MenuTile
              onPress={() => router.push("/publicities")}
              title="Promo"
              icon={<Ionicons name="pricetag" size={22} color="#F8BBD0" />}
            />
          </View> */}
        </View>

        <View className="mt-6">
          <TouchableOpacity
            className="flex-row items-center justify-between px-5 mb-3"
            onPress={() => router.push("/publicities")}
          >
            <Text className="text-xl font-bold ">Promo Terbaru</Text>

            <Text>Lihat Semua</Text>
          </TouchableOpacity>

          <FlatList
            horizontal
            data={promos}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
            contentContainerStyle={
              {
                // paddingHorizontal: 20,
              }
            }
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <PromoCarouselCard item={item} onPress={() => onDetail(item)} />
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;

function PromoCarouselCard({
  item,
  onPress,
}: {
  item: any;
  onPress: () => void;
}) {
  const imageChallengeURL = (fileName?: string) => {
    if (!fileName) {
      return "https://placehold.co/600x400/png";
    }
    return `${PATH_PUBLIC_IMAGE_PUBLICITY}/${fileName}`;
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="bg-white rounded-3xl overflow-hidden"
      style={{
        width: Dimensions.get("window").width * 0.82,
      }}
    >
      <Image
        source={{
          uri: imageChallengeURL(item.photo),
        }}
        resizeMode="cover"
        style={{
          width: "100%",
          height: 180,
        }}
      />

      <View className="p-4">
        <View className="bg-pink-100 self-start px-3 py-1 rounded-full">
          <Text className="text-pink-600 text-xs font-bold">PROMO</Text>
        </View>

        <Text
          numberOfLines={2}
          className="text-lg font-bold text-gray-800 mt-3"
        >
          {item.headline}
        </Text>

        <Text className="text-gray-500 mt-2">
          {formatDate(item.from_date)} - {formatDate(item.thru_date)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
