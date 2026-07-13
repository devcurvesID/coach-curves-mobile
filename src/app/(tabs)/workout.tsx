import { InformationWorkOutView } from "@/components/profile/information-workout";
import { ProfileCardView } from "@/components/profile/profile-card";
import { LoadingView } from "@/components/ui/loading";
import Text from "@/components/ui/text";
import { DataWorkoutHistoryView } from "@/components/workout/list-workout";
import { useAuth } from "@/context/auth";
import { getDateTime } from "@/helpers/dates";
import { useLastWorkout, useLastWorkoutSocket } from "@/hooks/useWorkout";
import { socket } from "@/services/socket";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const WorkOutScreen = () => {
  useLastWorkoutSocket();

  const { user, isLoading, onReloadUserMobile } = useAuth();
  const {
    data: lastWorkout,
    error,
    isLoading: isLoadingLastWorkout,
    refetch,
  } = useLastWorkout();
  React.useEffect(() => {
    console.log("socket.connected", socket.connected);
    socket.emit("user-curves", `${user._id}_${user.source_id}`);

    // socket.on("workout", (data) => {
    //   console.log("notif workout => ", data);
    // });

    // socket.on("notification", async (data) => {
    //   onReloadUserMobile();
    // });
    // return () => {
    //   socket.off("notification");
    // };
  }, []);
  const { colorScheme } = useColorScheme(); // "light" | "dark"

  if (isLoadingLastWorkout) {
    return <LoadingView />;
  }

  const checkIsWorkOutToday = () => {
    if (!lastWorkout) {
      return false;
    }
    let curr_date = getDateTime(new Date());
    let last_workout = getDateTime(lastWorkout.workout_date);
    console.log(curr_date, last_workout);
    if (curr_date === last_workout) {
      return true;
    }
    return false;
  };
  const colors = React.useMemo<[string, string]>(() => {
    if (colorScheme == "dark") {
      return ["#6F3FA0", "#BB86FC"];
    }
    return ["#BB86FC", "#6F3FA0"];
  }, [colorScheme]);
  if (isLoading) {
    return <LoadingView />;
  }
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
        <ProfileCardView />
        {checkIsWorkOutToday() ? (
          <InformationWorkOutView />
        ) : (
          <>
            <View className="pt-5">
              {/* <SectionTitle>Your Weekly Progress</SectionTitle> */}

              {/* QR CONTAINER */}
              <View className="items-center justify-center">
                <View className="bg-white p-5 rounded-[28px] shadow-2xl shadow-purple-500/40">
                  {/* QR CODE */}
                  <QRCode
                    // value={`${user._id}-${user.source_id}`}
                    value={user.user_personal.key_tag_id}
                    logo={require("@/assets/images/logocurves.png")}
                    logoSize={40}
                    logoBackgroundColor="#F2F2F2"
                    color="#BB86FC"
                    size={300}
                  />
                </View>

                {/* MEMBER INFO */}
                <View className="items-center mt-5">
                  <Text className="text-white text-lg font-bold">
                    {user.name}
                  </Text>

                  <Text className="text-white/70 text-sm mt-1">
                    MEMBER ID • {user.user_personal.key_tag_id}
                  </Text>
                </View>
              </View>
            </View>
            {!isLoadingLastWorkout && lastWorkout && (
              <DataWorkoutHistoryView data={lastWorkout} />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkOutScreen;
