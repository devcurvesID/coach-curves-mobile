import { InformationWorkOutView } from "@/components/profile/information-workout";
import { ProfileCardView } from "@/components/profile/profile-card";
import { FullscreenImage } from "@/components/ui/fullscreen-image";
import { LoadingView } from "@/components/ui/loading";
import { DataWorkoutHistoryView } from "@/components/workout/list-workout";
import { useAuth } from "@/context/auth";
import { getDateTime } from "@/helpers/dates";
import { useLastWorkout, useLastWorkoutSocket } from "@/hooks/useWorkout";
import { socket } from "@/services/socket";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

const MemberQrCode = ({
  memberName,
  keyTagId,
}: {
  memberName: string;
  keyTagId: string;
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const qrSize = Math.max(Math.min(screenWidth - 128, 330), 180);

  const renderQrCode = (size: number) => (
    <View style={styles.qrCard}>
      <QRCode
        value={keyTagId}
        logo={require("@/assets/images/logocurves.png")}
        logoSize={size > 350 ? 48 : 40}
        logoBackgroundColor="#F2F2F2"
        color="#8B5CF6"
        backgroundColor="#FFFFFF"
        quietZone={12}
        size={size}
      />
    </View>
  );

  return (
    <View style={styles.qrSection}>
      <FullscreenImage
        accessibilityLabel="Buka QR code dalam layar penuh"
        thumbnailSize={qrSize + 40}
        thumbnail={renderQrCode(qrSize)}
        fullscreenContent={({ width: modalWidth }) =>
          renderQrCode(Math.min(modalWidth - 64, 420))
        }
      />
      <View style={styles.memberInformation}>
        <Text style={styles.memberName}>{memberName}</Text>
        <Text style={styles.memberId}>MEMBER ID • {keyTagId}</Text>
        <Text style={styles.qrHint}>Ketuk QR untuk memperbesar</Text>
      </View>
    </View>
  );
};

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
              <MemberQrCode
                memberName={user.name}
                keyTagId={String(user.user_personal.key_tag_id)}
              />
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

const styles = StyleSheet.create({
  qrSection: { alignItems: "center", justifyContent: "center" },
  qrCard: {
    padding: 20,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  memberInformation: { alignItems: "center", marginTop: 20 },
  memberName: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
  memberId: { marginTop: 4, fontSize: 13, color: "rgba(255,255,255,0.72)" },
  qrHint: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: "hidden",
    borderRadius: 16,
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.86)",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
});
