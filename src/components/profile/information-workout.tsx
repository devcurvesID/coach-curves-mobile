import { formatDate } from "@/helpers/dates";
import { useWeighMeasureHistory } from "@/hooks/useWeighMeasure";
import { useWorkoutHistory } from "@/hooks/useWorkout";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { Circle, Svg } from "react-native-svg";

interface IProfileCard {
  data: any;
}

// ─── SVG Ring Progress ────────────────────────────────────────────────────────
const RingProgress = ({
  percentage,
  size = 110,
  strokeWidth = 12,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const progress = circ * (1 - Math.min(percentage, 100) / 100);
  const animVal = useRef(new Animated.Value(circ)).current;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: progress,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#FBCFE8"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#E91E63"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={progress}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={{ fontSize: 20, fontWeight: "800", color: "#E91E63" }}>
        {Math.round(percentage)}%
      </Text>
    </View>
  );
};
// ─── Section Card ─────────────────────────────────────────────────────────────
const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) => (
  <View
    style={[
      {
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        padding: 20,
        shadowColor: "#E91E63",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
      },
      style,
    ]}
  >
    {children}
  </View>
);

const SectionTitle = ({
  children,
  color = "#E91E63",
}: {
  children: string;
  color?: string;
}) => (
  <Text
    style={{
      fontSize: 14,
      fontWeight: "800",
      color,
      textAlign: "center",
      letterSpacing: 0.2,
    }}
  >
    {children}
  </Text>
);

const Divider = () => (
  <View
    style={{
      borderTopWidth: 1,
      borderColor: "#FBCFE8",
      borderStyle: "dashed",
      marginVertical: 14,
    }}
  />
);

export const InformationWorkOutView = () => {
  const {
    mutate: workoutHistoryFn,
    data: workoutHistory,
    isPending,
  } = useWorkoutHistory();
  const {
    mutate: weighMeasureHistoryFn,
    data: weighMeasureHistory,
    isPending: isPendingWM,
  } = useWeighMeasureHistory();

  React.useEffect(() => {
    async function getWorkout() {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      await workoutHistoryFn({ year: currentYear, month: currentMonth });
    }
    getWorkout();
  }, []);

  React.useEffect(() => {
    async function getWeighMeasure() {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      await weighMeasureHistoryFn({ year: currentYear, month: currentMonth });
    }
    getWeighMeasure();
  }, []);

  const getPercentageWorkout = (total: number) => {
    const percentage = (total / 12) * 100;
    return percentage;
  };
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      {/* LEFT COLUMN */}
      <View style={{ flex: 1, gap: 12 }}>
        {/* Total Workout Card */}

        {/* Big number */}
        {!isPending && workoutHistory && (
          <Card
            style={{
              backgroundColor: "#FFF0F6",
              borderWidth: 1,
              borderColor: "#FBCFE8",
            }}
          >
            <SectionTitle>Latihan Total</SectionTitle>
            <SectionTitle>Sejak Menjadi Anggota</SectionTitle>
            <Divider />
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 14,
                alignItems: "center",
                marginBottom: 12,
                shadowColor: "#E91E63",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: "900",
                  color: "#6F3FA0",
                  lineHeight: 54,
                }}
              >
                {workoutHistory.total}
                <Text style={{ fontSize: 20, color: "#E91E63" }}>x</Text>
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  textAlign: "center",
                  marginTop: 2,
                }}
              >
                latihan sejak jadi anggota
              </Text>
            </View>
            <Divider />

            <View
              style={{
                backgroundColor: "#FCE4EC",
                borderRadius: 16,
                padding: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Ionicons name="flag" size={14} color="#E91E63" />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: "#E91E63",
                  }}
                >
                  Target
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "baseline",
                  gap: 4,
                  marginTop: 4,
                  // height: 100,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "900",
                    color: "#E91E63",
                    // flex: 1,
                  }}
                >
                  {12 - workoutHistory.total_workout_per_month}x
                </Text>
                <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                  lagi untuk capai
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "900",
                  color: "#FF1493",
                  textAlign: "right",
                  // marginTop: -4,
                }}
              >
                12!
              </Text>
            </View>
          </Card>
        )}

        {/* Promo Card */}
        <Card
          style={{
            backgroundColor: "#F5F3FF",
            borderWidth: 1,
            borderColor: "#DDD6FE",
            minHeight: 160,
          }}
        >
          <SectionTitle color="#7C3AED">Promosi Mitra Curves</SectionTitle>
          <Divider />
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              paddingVertical: 12,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "#EDE9FE",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <MaterialCommunityIcons
                name="gift-outline"
                size={28}
                color="#A78BFA"
              />
            </View>
            <Text
              style={{
                fontSize: 12,
                color: "#9CA3AF",
                textAlign: "center",
                lineHeight: 18,
              }}
            >
              Belum ada promosi{"\n"}tersedia
            </Text>
          </View>
        </Card>
      </View>

      {/* RIGHT COLUMN */}
      {!isPending && workoutHistory && (
        <View style={{ flex: 1, gap: 12 }}>
          {/* Monthly Workout Card */}
          <Card
            style={{
              backgroundColor: "#FFF0F6",
              borderWidth: 1,
              borderColor: "#FBCFE8",
            }}
          >
            <SectionTitle>Total Latihan Bulan Ini</SectionTitle>
            <Divider />

            <View style={{ alignItems: "center" }}>
              <RingProgress
                percentage={getPercentageWorkout(
                  workoutHistory.total_workout_per_month,
                )}
                size={110}
                strokeWidth={11}
              />

              <View
                style={{
                  backgroundColor: "#FCE4EC",
                  borderRadius: 16,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  marginTop: 14,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 26,
                    fontWeight: "900",
                    color: "#FF1493",
                  }}
                >
                  Ayo! 🔥
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: "#E91E63",
                    textAlign: "center",
                    marginTop: 2,
                  }}
                >
                  capai 12x bulan ini!
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                hanya perlu latihan minimal
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#6F3FA0",
                  marginTop: 2,
                }}
              >
                {12 - workoutHistory.total_workout_per_month} kali lagi!
              </Text>
            </View>
          </Card>
          {/* Schedule Card */}

          {!isPendingWM && weighMeasureHistory && (
            <Card
              style={{
                backgroundColor: "#FFF0F6",
                borderWidth: 1,
                borderColor: "#FBCFE8",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Ionicons name="calendar" size={16} color="#E91E63" />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "800",
                    color: "#E91E63",
                  }}
                >
                  Jadwal
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#9C27B0",
                  marginTop: 2,
                }}
              >
                Penimbangan & Pengukuran
              </Text>
              <Divider />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "#FCE4EC",
                  borderRadius: 14,
                  padding: 10,
                }}
              >
                <Ionicons name="heart" size={16} color="#EC4899" />
                <Text
                  style={{
                    fontSize: 12,
                    color: "#EC4899",
                    fontWeight: "600",
                  }}
                >
                  {weighMeasureHistory.response.length > 0
                    ? formatDate(weighMeasureHistory.response[0].created_at)
                    : "Belum dijadwalkan"}
                </Text>
              </View>
            </Card>
          )}

          {/* Message Card */}
          <Card
            style={{
              backgroundColor: "#FFF0F6",
              borderWidth: 1,
              borderColor: "#FBCFE8",
              minHeight: 160,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <FontAwesome5 name="comment-dots" size={14} color="#E91E63" />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "800",
                  color: "#E91E63",
                }}
              >
                Pesan
              </Text>
            </View>
            <Divider />
            <View
              style={{
                alignItems: "center",
                flex: 1,
                paddingVertical: 8,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#FCE4EC",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <FontAwesome5 name="comment-dots" size={22} color="#F48FB1" />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: "#9CA3AF",
                  textAlign: "center",
                  lineHeight: 18,
                }}
              >
                Belum ada pesan
              </Text>
            </View>
          </Card>
        </View>
      )}
    </View>
  );
};
