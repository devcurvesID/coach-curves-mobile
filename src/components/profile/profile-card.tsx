import { FullscreenImage } from "@/components/ui/fullscreen-image";
import { useAuth } from "@/context/auth";
import { formatDate } from "@/helpers/dates";
import { getMemberFlag, MONTHLY_WORKOUT_TARGET } from "@/helpers/member-flag";
import { useWorkoutHistory } from "@/hooks/useWorkout";
import { imageProfileURL } from "@/services/image";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, View } from "react-native";
interface IProfileCard {
  data: any;
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
const StatPill = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: color + "18",
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 12,
      gap: 8,
      flex: 1,
    }}
  >
    {icon}
    <View>
      <Text
        style={{
          fontSize: 10,
          color: "#9CA3AF",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontSize: 15, fontWeight: "800", color }}>{value}</Text>
    </View>
  </View>
);

export const ProfileCardView = () => {
  const {
    mutate: workoutHistoryFn,
    data: workoutHistory,
    isPending,
  } = useWorkoutHistory();
  const { user, isLoading } = useAuth();
  React.useEffect(() => {
    async function getWorkout() {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      await workoutHistoryFn({ year: currentYear, month: currentMonth });
    }
    getWorkout();
  }, []);
  if (isLoading || !user?.user_personal) return null;

  const user_personal = user.user_personal;
  const monthlyWorkoutCount = workoutHistory?.total_workout_per_month ?? 0;
  const memberFlag = getMemberFlag(monthlyWorkoutCount);
  const remainingWorkout = Math.max(
    MONTHLY_WORKOUT_TARGET - monthlyWorkoutCount,
    0,
  );
  const progress = Math.min(
    (monthlyWorkoutCount / MONTHLY_WORKOUT_TARGET) * 100,
    100,
  );
  const photoUrl = imageProfileURL(user_personal.photo);
  return (
    // {/* ── PROFILE CARD ── */}
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#9C27B0",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 6,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Avatar with ring */}
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
            <FullscreenImage
              imageUrl={photoUrl}
              accessibilityLabel="Buka foto profil dalam layar penuh"
              thumbnailSize={64}
              thumbnailIndicatorPosition="top-right"
              thumbnail={
                <Image
                  source={{ uri: photoUrl }}
                  style={{ width: "100%", height: "100%", borderRadius: 36 }}
                />
              }
            />
          </View>
          {/* Online dot */}
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

        {/* Info */}
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#6F3FA0" }}>
            {user.name}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
            <Text style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 5 }}>
              Bergabung {formatDate(user.user_personal.joined)}
            </Text>
          </View>
        </View>

        {/* Badge */}
        <View
          style={{
            backgroundColor: "#F3E8FF",
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#7C3AED" }}>
            Member ✨
          </Text>
        </View>
      </View>

      {/* Stat pills */}
      {!isPending && workoutHistory && (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
          <StatPill
            icon={<Ionicons name="flame" size={18} color="#E91E63" />}
            label="Bulan Ini"
            value={`${monthlyWorkoutCount}x`}
            color="#E91E63"
          />
          <StatPill
            icon={<Ionicons name="trophy" size={18} color={memberFlag.color} />}
            label="Member Flag"
            value={`Flag ${memberFlag.flag}`}
            color={memberFlag.color}
          />
        </View>
      )}
      {!isPending && workoutHistory && (
        <View
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 18,
            backgroundColor: "#F8FAFC",
          }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B" }}>
              Target bulanan
            </Text>
            <Text style={{ fontSize: 11, fontWeight: "800", color: "#6F3FA0" }}>
              {remainingWorkout === 0
                ? "Target tercapai"
                : `${remainingWorkout} sesi lagi`}
            </Text>
          </View>
          <View
            style={{
              height: 7,
              marginTop: 9,
              overflow: "hidden",
              borderRadius: 4,
              backgroundColor: "#E2E8F0",
            }}
          >
            <View
              style={{
                width: `${progress}%` as `${number}%`,
                height: "100%",
                borderRadius: 4,
                backgroundColor: memberFlag.color,
              }}
            />
          </View>
          <Text style={{ marginTop: 7, fontSize: 10, color: "#94A3B8" }}>
            {monthlyWorkoutCount} dari {MONTHLY_WORKOUT_TARGET} sesi bulan ini
          </Text>
        </View>
      )}
    </View>
  );
};
