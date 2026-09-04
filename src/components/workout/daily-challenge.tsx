import { FullscreenImage } from "@/components/ui/fullscreen-image";
import { formatDate } from "@/helpers/dates";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const DAILY_CHALLENGE_ENDPOINT = `${API_BASE_URL}/api/challenges/daily-challenge`;

interface DailyChallengeViewProps {
  challengeDate?: Date;
}

const formatDateParameter = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const DailyChallengeView = ({
  challengeDate,
}: DailyChallengeViewProps) => {
  const displayedDate = challengeDate ?? new Date();
  const dateParameter = formatDateParameter(displayedDate);
  const imageUrl = challengeDate
    ? `${DAILY_CHALLENGE_ENDPOINT}?date_challenge=${dateParameter}`
    : DAILY_CHALLENGE_ENDPOINT;
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isImageUnavailable, setIsImageUnavailable] = useState(false);

  useEffect(() => {
    setIsImageLoading(true);
    setIsImageUnavailable(false);
  }, [imageUrl]);

  return (
    <View className="items-center justify-center">
      <View className="mt-5 w-full overflow-hidden rounded-3xl bg-white">
        {isImageUnavailable ? (
          <View className="items-center px-6 py-10">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-purple-50">
              <Ionicons name="calendar-outline" size={38} color="#9333EA" />
            </View>
            <Text className="mt-5 text-center text-lg font-bold text-slate-800">
              Tidak Ada Challenge
            </Text>
            <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
              Challenge pada {formatDate(dateParameter)} belum tersedia. Silakan
              pilih tanggal lainnya.
            </Text>
          </View>
        ) : (
          <>
            <View>
              <FullscreenImage
                imageUrl={imageUrl}
                accessibilityLabel="Buka gambar challenge harian dalam layar penuh"
                thumbnailStyle={styles.fullWidth}
                thumbnail={
                  <Image
                    source={{ uri: imageUrl }}
                    resizeMode="cover"
                    style={styles.image}
                    onLoadStart={() => setIsImageLoading(true)}
                    onLoad={() => setIsImageLoading(false)}
                    onError={() => {
                      setIsImageLoading(false);
                      setIsImageUnavailable(true);
                    }}
                  />
                }
              />
              {isImageLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#9333EA" />
                  <Text className="mt-3 text-sm text-slate-500">
                    Memuat challenge...
                  </Text>
                </View>
              )}
            </View>

            <View className="p-4">
              <Text
                numberOfLines={2}
                className="mt-3 text-lg font-bold text-gray-800"
              >
                {challengeDate ? "Challenge Harian" : "Challenge Hari Ini"}
              </Text>
              <Text className="mt-2 text-gray-500">
                {formatDate(dateParameter)}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 300,
  },
  fullWidth: {
    width: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
});
