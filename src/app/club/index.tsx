import ContainerPage from "@/components/ui/container-page";
import { FullscreenImage } from "@/components/ui/fullscreen-image";
import { useCoachesByClubId } from "@/hooks/useClubs";
import { clubImageURL } from "@/services/image";
import { imageProfileURL } from "@/services/image";
import { openGoogleMaps } from "@/services/maps";
import { openWhatsApp } from "@/services/whatsapp";
import type { Club, ClubCoach } from "@/types/club";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ClubDetail extends Club {
  country?: string;
  postal?: string | number;
  email?: string;
  facebook?: string;
}

interface InformationItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string | number | null;
}

const InformationItem = ({ icon, label, value }: InformationItemProps) => (
  <View className="flex-row items-start py-3.5">
    <View className="h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
      <Ionicons name={icon} size={19} color="#7C3AED" />
    </View>
    <View className="ml-3 flex-1">
      <Text className="text-xs font-medium text-slate-400">{label}</Text>
      <Text className="mt-1 text-[15px] leading-5 text-slate-700">
        {value || "-"}
      </Text>
    </View>
  </View>
);

const LocationSummary = ({ club }: { club: ClubDetail }) => (
  <View style={styles.informationCard}>
    <View className="flex-row items-center">
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-purple-100">
        <Ionicons name="location" size={22} color="#7C3AED" />
      </View>
      <View className="ml-3">
        <Text className="text-lg font-bold text-slate-900">Lokasi Club</Text>
        <Text className="mt-0.5 text-xs text-slate-400">
          Alamat dan wilayah operasional
        </Text>
      </View>
    </View>

    <View className="my-4 h-px bg-slate-100" />
    <Text className="text-[15px] leading-6 text-slate-700">
      {club.address || "Alamat belum tersedia"}
    </Text>

    <View className="mt-4 flex-row flex-wrap">
      {[
        { label: "Kota", value: club.city },
        { label: "Provinsi", value: club.province },
        { label: "Negara", value: club.country },
        { label: "Kode Pos", value: club.postal },
      ].map((item) => (
        <View key={item.label} className="mb-3 w-1/2 pr-2">
          <Text className="text-xs text-slate-400">{item.label}</Text>
          <Text
            className="mt-1 font-semibold capitalize text-slate-800"
            numberOfLines={1}
          >
            {item.value || "-"}
          </Text>
        </View>
      ))}
    </View>
  </View>
);

const getCoachInformation = (coach: ClubCoach) => {
  const name = coach.user?.name || coach.name || "Coach Curves";
  const email = coach.user?.email || coach.email;
  const phone =
    coach.phone ||
    coach.user_personal?.phone ||
    coach.user?.user_personal?.phone;
  const photo =
    coach.photo ||
    coach.user_personal?.photo ||
    coach.user?.user_personal?.photo;

  return { name, email, phone, photo };
};

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
};

const CoachAvatar = ({
  name,
  photo,
}: {
  name: string;
  photo?: string | null;
}) => {
  const [hasImageError, setHasImageError] = React.useState(false);

  React.useEffect(() => {
    setHasImageError(false);
  }, [photo]);

  if (!photo || hasImageError) {
    return (
      <View style={styles.coachInitialAvatar}>
        <Text style={styles.coachInitialText}>{getInitials(name)}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageProfileURL(photo) }}
      style={styles.coachAvatar}
      onError={() => setHasImageError(true)}
    />
  );
};

const CoachCard = ({ coach }: { coach: ClubCoach }) => {
  const { name, email, phone, photo } = getCoachInformation(coach);

  const contactCoach = (): Promise<void> =>
    openWhatsApp({
      phoneNumber: phone,
      message: `Halo Coach ${name}, saya ingin mendapatkan informasi mengenai latihan di Curves.`,
      unavailableMessage: "Nomor WhatsApp coach belum tersedia.",
    });

  return (
    <View style={styles.coachCard}>
      <View className="flex-row items-center">
        <View style={styles.coachAvatarRing}>
          <CoachAvatar name={name} photo={photo} />
        </View>
        <View className="ml-3 flex-1">
          <Text
            className="text-base font-bold capitalize text-slate-900"
            numberOfLines={1}
          >
            {name}
          </Text>
          <View className="mt-1 self-start rounded-full bg-purple-50 px-2.5 py-1">
            <Text className="text-[10px] font-bold uppercase tracking-wide text-purple-700">
              Coach Curves
            </Text>
          </View>
        </View>
      </View>

      <View className="my-4 h-px bg-slate-100" />
      <View className="min-h-[42px]">
        <View className="flex-row items-center">
          <Ionicons name="mail-outline" size={16} color="#64748B" />
          <Text
            className="ml-2 flex-1 text-xs text-slate-500"
            numberOfLines={1}
          >
            {email || "Email belum tersedia"}
          </Text>
        </View>
        <View className="mt-2 flex-row items-center">
          <Ionicons name="call-outline" size={16} color="#64748B" />
          <Text
            className="ml-2 flex-1 text-xs text-slate-500"
            numberOfLines={1}
          >
            {phone || "Nomor belum tersedia"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        disabled={!phone}
        activeOpacity={0.85}
        onPress={() => void contactCoach()}
        className={`mt-4 flex-row items-center justify-center rounded-2xl py-3 ${
          phone ? "bg-[#25D366]" : "bg-slate-200"
        }`}
      >
        <MaterialCommunityIcons
          name="whatsapp"
          size={19}
          color={phone ? "#FFFFFF" : "#94A3B8"}
        />
        <Text
          className={`ml-2 font-bold ${phone ? "text-white" : "text-slate-400"}`}
        >
          Hubungi Coach
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const CoachesSection = ({ clubId }: { clubId: string }) => {
  const {
    data: coaches = [],
    isLoading,
    isError,
    refetch,
  } = useCoachesByClubId(clubId);

  return (
    <View style={[styles.informationCard, styles.cardSpacing]}>
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-pink-100">
          <Ionicons name="people" size={22} color="#DB2777" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-lg font-bold text-slate-900">Tim Coach</Text>
          <Text className="mt-0.5 text-xs text-slate-400">
            {isLoading
              ? "Memuat coach di club ini"
              : `${coaches.length} coach siap mendampingi member`}
          </Text>
        </View>
        {!isLoading && coaches.length > 0 && (
          <View className="h-9 min-w-9 items-center justify-center rounded-full bg-pink-50 px-2.5">
            <Text className="font-bold text-pink-600">{coaches.length}</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View className="items-center py-10">
          <ActivityIndicator color="#7C3AED" />
          <Text className="mt-3 text-sm text-slate-500">
            Memuat daftar coach...
          </Text>
        </View>
      ) : isError ? (
        <View className="mt-5 items-center rounded-2xl bg-red-50 px-5 py-7">
          <Ionicons name="cloud-offline-outline" size={31} color="#DC2626" />
          <Text className="mt-3 text-center font-semibold text-red-700">
            Daftar coach gagal dimuat
          </Text>
          <TouchableOpacity
            onPress={() => void refetch()}
            className="mt-4 rounded-xl bg-red-600 px-5 py-2.5"
          >
            <Text className="font-bold text-white">Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : coaches.length === 0 ? (
        <View className="mt-5 items-center rounded-2xl bg-slate-50 px-5 py-8">
          <Ionicons name="people-outline" size={36} color="#94A3B8" />
          <Text className="mt-3 text-center font-semibold text-slate-700">
            Belum ada coach terdaftar
          </Text>
          <Text className="mt-1 text-center text-xs leading-5 text-slate-500">
            Informasi coach untuk club ini belum tersedia.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.coachList}
        >
          {coaches.map((coach, index) => (
            <CoachCard
              key={coach._id || coach.user_id || `coach-${index}`}
              coach={coach}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default function InformationClubScreen() {
  const params = useLocalSearchParams<{ data: string }>();
  const club = JSON.parse(params.data) as ClubDetail;
  const isActive = club.status.toLowerCase() === "active";
  const clubPhotoUrl = clubImageURL(club.photo);

  const handleWhatsApp = (): Promise<void> =>
    openWhatsApp({
      phoneNumber: club.phones,
      message: `Halo, saya ingin mendapatkan informasi lebih lanjut mengenai ${club.club_name}.`,
      unavailableMessage: "Nomor WhatsApp club belum tersedia.",
    });

  const handleOpenMaps = (): Promise<void> =>
    openGoogleMaps({
      placeName: club.club_name,
      address: club.address,
    });

  return (
    <ContainerPage titleHeader={club.club_name} titleContent="Informasi Club">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-1 pt-2 pb-32"
        showsVerticalScrollIndicator={false}
      >
        <FullscreenImage
          imageUrl={clubPhotoUrl}
          accessibilityLabel="Buka foto club dalam layar penuh"
          thumbnailStyle={styles.heroImageButton}
          thumbnail={
            <ImageBackground
              source={{ uri: clubPhotoUrl }}
              resizeMode="cover"
              style={styles.heroImage}
              imageStyle={styles.heroImageRadius}
            >
              <LinearGradient
                colors={["transparent", "rgba(15, 23, 42, 0.88)"]}
                locations={[0.35, 1]}
                style={styles.heroOverlay}
              />

              <View
                className={`absolute right-4 top-4 flex-row items-center rounded-full px-3 py-2 ${
                  isActive ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <View
                  className={`mr-2 h-2 w-2 rounded-full ${
                    isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <Text
                  className={`text-xs font-bold capitalize ${
                    isActive ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {club.status}
                </Text>
              </View>

              <View className="absolute bottom-0 left-0 right-0 p-5">
                <View className="self-start rounded-full bg-white/20 px-3 py-1.5">
                  <Text className="text-xs font-bold uppercase tracking-widest text-white">
                    {club.club_code}
                  </Text>
                </View>
                <Text className="mt-3 text-2xl font-bold capitalize text-white">
                  {club.club_name}
                </Text>
                <View className="mt-2 flex-row items-center">
                  <Ionicons name="location-outline" size={16} color="#E2E8F0" />
                  <Text className="ml-1.5 flex-1 text-sm capitalize text-slate-200">
                    {[club.city, club.province].filter(Boolean).join(", ")}
                  </Text>
                </View>
              </View>
            </ImageBackground>
          }
        ></FullscreenImage>

        <View className="mt-6">
          <LocationSummary club={club} />

          <View style={[styles.informationCard, styles.cardSpacing]}>
            <View className="flex-row items-center">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-blue-100">
                <Ionicons
                  name="chatbubble-ellipses"
                  size={21}
                  color="#2563EB"
                />
              </View>
              <View className="ml-3">
                <Text className="text-lg font-bold text-slate-900">
                  Informasi Kontak
                </Text>
                <Text className="mt-0.5 text-xs text-slate-400">
                  Hubungi club untuk informasi lebih lanjut
                </Text>
              </View>
            </View>

            <View className="mt-3 divide-y divide-slate-100">
              <InformationItem
                icon="call-outline"
                label="Telepon"
                value={club.phones}
              />
              <InformationItem
                icon="mail-outline"
                label="Email"
                value={club.email}
              />
              <InformationItem
                icon="logo-facebook"
                label="Facebook"
                value={club.facebook}
              />
            </View>
          </View>

          <CoachesSection clubId={club._id} />

          <View className="mb-10 mt-6 flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => void handleWhatsApp()}
              className="h-14 flex-1 flex-row items-center justify-center rounded-2xl bg-[#25D366]"
              style={styles.actionButton}
            >
              <MaterialCommunityIcons
                name="whatsapp"
                size={22}
                color="#FFFFFF"
              />
              <Text className="ml-2 text-base font-bold text-white">
                WhatsApp
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => void handleOpenMaps()}
              className="h-14 flex-1 flex-row items-center justify-center rounded-2xl bg-blue-600"
              style={styles.actionButton}
            >
              <Ionicons name="map" size={21} color="#FFFFFF" />
              <Text className="ml-2 text-base font-bold text-white">Maps</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ContainerPage>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    height: 260,
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: "#EDE9FE",
  },
  heroImageButton: {
    width: "100%",
    height: 260,
  },
  heroImageRadius: {
    borderRadius: 28,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },
  informationCard: {
    padding: 18,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  cardSpacing: {
    marginTop: 16,
  },
  coachList: {
    gap: 12,
    paddingTop: 18,
    paddingRight: 4,
  },
  coachCard: {
    width: 270,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3E8FF",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  coachAvatarRing: {
    width: 62,
    height: 62,
    padding: 2,
    borderWidth: 2,
    borderColor: "#E9D5FF",
    borderRadius: 31,
  },
  coachAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    backgroundColor: "#F3E8FF",
  },
  coachInitialAvatar: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
    backgroundColor: "#7C3AED",
  },
  coachInitialText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  actionButton: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
});
