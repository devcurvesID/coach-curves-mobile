import Container from "@/components/ui/container";
import MenuItem from "@/components/ui/menu-item";
import RankOneCard, {
  type RankOneCardData,
} from "@/components/workout/rank-one-card";
import { useAuth } from "@/context/auth";
import { useUserClub } from "@/hooks/useClubs";
import { useCreateMemberRank } from "@/hooks/useMemberRank";
import { useUpdateUser } from "@/hooks/useUsers";
import { useWeighMeasurePrintout } from "@/hooks/useWeighMeasure";
import { imageProfileURL } from "@/services/image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: userClub, isLoading: isLoadingUserClub } = useUserClub();
  const { mutateAsync: updateUser } = useUpdateUser();
  const { mutateAsync: createMemberRank, isPending: isCreatingMemberRank } =
    useCreateMemberRank();
  const { mutate: loadWeighMeasurePrintout, data: weighMeasurePrintout } =
    useWeighMeasurePrintout();

  const user_personal = user.user_personal;

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    loadWeighMeasurePrintout(`?wm_date=${year}-${month}-${day}`);
  }, [loadWeighMeasurePrintout]);

  const rankCardData: RankOneCardData = {
    club: {
      club_name:
        !isLoadingUserClub && userClub?.[0]?.club_name
          ? userClub[0].club_name
          : "",
    },
    weigh_diff: weighMeasurePrintout?.weigh_diff ?? 0,
    size_diff: weighMeasurePrintout?.size_diff ?? 0,
    body_fat_diff: weighMeasurePrintout?.body_fat_diff ?? 0,
    wo_count: weighMeasurePrintout?.wo_count ?? 0,
  };

  const openWeighMeasureProgress = async () => {
    const wmDate = weighMeasurePrintout?.current?.wm_date;

    if (!wmDate) {
      Alert.alert(
        "Data belum tersedia",
        "Tanggal pengukuran terbaru tidak ditemukan. Silakan coba kembali.",
      );
      return;
    }

    try {
      await createMemberRank({
        weigh_diff: rankCardData.weigh_diff,
        size_diff: rankCardData.size_diff,
        body_fat_diff: rankCardData.body_fat_diff,
        wo_count: rankCardData.wo_count,
        wm_date: wmDate,
      });

      router.push("/user/weigh-measure-progress");
    } catch (error) {
      Alert.alert(
        "Gagal membuka detail",
        error instanceof Error
          ? error.message
          : "Data peringkat gagal disimpan. Silakan coba kembali.",
      );
    }
  };

  const onSignOutUser = async () => {
    try {
      setIsSigningOut(true);
      setLogoutError(null);
      await updateUser({
        is_online: false,
      });
      await signOut();
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : "Logout gagal dilakukan. Silakan coba kembali.",
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  const openLogoutConfirmation = () => {
    setLogoutError(null);
    setIsLogoutModalVisible(true);
  };

  const closeLogoutConfirmation = () => {
    if (isSigningOut) return;
    setIsLogoutModalVisible(false);
    setLogoutError(null);
  };
  return (
    <Container>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-20 pb-40"
        showsVerticalScrollIndicator={false}
        // contentContainerClassName="px-6 pt-14 pb-32"
        // showsVerticalScrollIndicator={false}
      >
        {weighMeasurePrintout ? (
          <View className="pt-4">
            <RankOneCard
              data={rankCardData}
              isDetailLoading={isCreatingMemberRank}
              onPressDetail={() => void openWeighMeasureProgress()}
            />
          </View>
        ) : (
          <View className="items-center">
            <LinearGradient
              colors={["#6F3FA0", "#BB86FC"]}
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={{
                  uri: imageProfileURL(user_personal.photo),
                }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                }}
              />
            </LinearGradient>

            <Text className="text-2xl font-bold mt-4">{user.name}</Text>
            {/* <Text className=" text-sm mt-1">Premium Member</Text> */}
          </View>
        )}

        {/* Header */}

        {/*  */}

        {/* Stats */}
        {/* <View className="flex-row gap-3 mt-8">
          <StatCard label="Workouts" value="124" />
          <StatCard label="Calories" value="32k" />
          <StatCard label="Hours" value="87h" />
        </View> */}

        {/* Divider */}
        <View className="h-[1px] bg-white/10 my-8" />

        <View className="mb-3">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Aktivitas Saya
          </Text>
          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Lihat hasil pengukuran dan aktivitas workout akun Anda.
          </Text>
        </View>
        <MenuItem
          icon="scale-outline"
          title="Weigh & Measure"
          onPress={() => router.push("/user/weigh-measure")}
        />
        <MenuItem
          icon="bar-chart-outline"
          title="Riwayat Workout"
          onPress={() => router.push("/user/attendance")}
        />
        <View className="my-5 h-px bg-gray-100 dark:bg-zinc-800" />

        {/* Menu */}
        <MenuItem
          icon="person-outline"
          title="Informasi Profile"
          onPress={() => router.push("/user")}
        />
        <MenuItem
          icon="key-outline"
          title="Ubah Username & Password"
          onPress={() => router.push("/user/update-account")}
        />
        <MenuItem
          icon="barbell-sharp"
          title="Rewards"
          onPress={() => router.push("/challenges/challenge-complete")}
        />
        <MenuItem
          icon="notifications-outline"
          title="Notifikasi"
          onPress={() => router.push("/notification")}
        />
        {/* <MenuItem
          icon="notifications-outline"
          title="Notifikasi"
          onPress={() => router.push("/notification")}
        /> 
       <MenuItem
          icon="settings-outline"
          title="Seting"
          onPress={() => router.push("/setting")}
        /> 
        <MenuItem icon="help-circle-outline" title="Help & Support" /> */}
        <MenuItem
          icon="log-out-outline"
          title="Logout"
          danger
          onPress={openLogoutConfirmation}
        />
      </ScrollView>

      <Modal
        visible={isLogoutModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeLogoutConfirmation}
      >
        <View className="flex-1 items-center justify-center bg-black/55 px-6">
          <View className="w-full max-w-sm rounded-[28px] bg-white px-6 pb-6 pt-7 shadow-2xl">
            <View className="items-center">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-red-100">
                  <Ionicons name="log-out-outline" size={30} color="#DC2626" />
                </View>
              </View>

              <Text className="mt-5 text-center text-xl font-bold text-slate-900">
                Keluar dari Akun?
              </Text>
              <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                Anda akan keluar dari akun {user.name}. Pastikan semua aktivitas
                Anda telah selesai.
              </Text>
            </View>

            {logoutError && (
              <View className="mt-4 flex-row items-start rounded-xl bg-red-50 px-3 py-3">
                <Ionicons
                  name="alert-circle-outline"
                  size={19}
                  color="#DC2626"
                />
                <Text className="ml-2 flex-1 text-sm leading-5 text-red-600">
                  {logoutError}
                </Text>
              </View>
            )}

            <View className="mt-6 flex-row gap-3">
              <Pressable
                disabled={isSigningOut}
                onPress={closeLogoutConfirmation}
                className={`flex-1 items-center rounded-2xl border border-slate-200 py-4 ${
                  isSigningOut ? "opacity-50" : "active:bg-slate-50"
                }`}
              >
                <Text className="font-bold text-slate-700">Batal</Text>
              </Pressable>

              <Pressable
                disabled={isSigningOut}
                onPress={() => void onSignOutUser()}
                className={`flex-1 flex-row items-center justify-center rounded-2xl bg-red-600 py-4 ${
                  isSigningOut ? "opacity-70" : "active:bg-red-700"
                }`}
              >
                {isSigningOut ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text className="ml-2 font-bold text-white">Keluar...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="log-out-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text className="ml-2 font-bold text-white">Logout</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Container>
  );
}
