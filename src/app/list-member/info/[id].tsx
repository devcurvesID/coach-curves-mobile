import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import { formatDate } from "@/helpers/dates";
import { useDetailMemberByUserId } from "@/hooks/useMember";
import { imageProfileURL } from "@/services/image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface MemberDetail {
  _id?: string;
  user_id: string;
  user: {
    name: string;
    email?: string | null;
  };
  photo?: string | null;
  flag?: string | null;
  sex?: string | null;
  birth?: string | null;
  joined?: string | null;
  phone?: string | number | null;
  cellphone?: string | number | null;
  address?: string | null;
  postal?: string | number | null;
  key_tag_id?: string | null;
  tshirt_size?: number | null;
}

interface InformationRowProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value?: string | number | null;
  lines?: number;
}

interface ActionTileProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
}

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const displayValue = (value?: string | number | null): string => {
  if (value === null || value === undefined) return "Belum tersedia";
  return String(value).trim() || "Belum tersedia";
};

const getGenderLabel = (sex?: string | null): string => {
  if (sex === "F") return "Perempuan";
  if (sex === "M") return "Laki-laki";
  return "Tidak diketahui";
};

const getTshirtSize = (size?: number | null): string => {
  const sizes: Record<number, string> = {
    1: "S",
    2: "M",
    3: "L",
    4: "XL",
    5: "XXL",
  };

  return size ? (sizes[size] ?? "-") : "-";
};

function InformationRow({
  icon,
  label,
  value,
  lines = 1,
}: InformationRowProps) {
  return (
    <View className="flex-row items-start border-b border-gray-100 py-4 last:border-b-0 dark:border-zinc-800">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
        <Ionicons name={icon} size={20} color="#6F3FA0" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {label}
        </Text>
        <Text
          numberOfLines={lines}
          className="mt-1 text-sm font-semibold text-gray-800 dark:text-white"
        >
          {displayValue(value)}
        </Text>
      </View>
    </View>
  );
}

function ActionTile({
  icon,
  title,
  subtitle,
  color,
  backgroundColor,
  onPress,
}: ActionTileProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mb-4 w-[48%] rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text className="mt-4 font-bold text-gray-900 dark:text-white">
        {title}
      </Text>
      <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {subtitle}
      </Text>
      <View className="mt-3 flex-row items-center">
        <Text className="mr-1 text-xs font-semibold" style={{ color }}>
          Buka
        </Text>
        <Ionicons name="arrow-forward" size={14} color={color} />
      </View>
    </TouchableOpacity>
  );
}

export default function DetailInformasiMemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    mutate: loadMemberDetail,
    data,
    isPending,
    isError,
  } = useDetailMemberByUserId();

  useEffect(() => {
    if (id) loadMemberDetail(id);
  }, [id, loadMemberDetail]);

  if (isPending && !data) return <LoadingView />;

  if (isError || !data) {
    return (
      <ContainerPage titleHeader="Detail Member" titleContent="Member">
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 rounded-full bg-red-50 p-5">
            <Ionicons name="alert-circle-outline" size={40} color="#DC2626" />
          </View>
          <Text className="text-center text-lg font-bold text-gray-800 dark:text-white">
            Informasi member gagal dimuat
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            Periksa koneksi Anda, lalu coba kembali.
          </Text>
          <TouchableOpacity
            onPress={() => id && loadMemberDetail(id)}
            className="mt-5 rounded-2xl bg-[#6F3FA0] px-6 py-3"
          >
            <Text className="font-bold text-white">Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </ContainerPage>
    );
  }

  const member = data as MemberDetail;
  const memberId = member.user_id || id;

  return (
    <ContainerPage titleHeader="Detail Member" titleContent={member.user.name}>
      <ScrollView
        contentContainerClassName="px-5 pb-32 pt-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="overflow-hidden rounded-3xl bg-[#6F3FA0] shadow-sm">
          <View className="items-center px-5 py-7">
            {member.photo ? (
              <Image
                source={{ uri: imageProfileURL(member.photo) }}
                className="h-24 w-24 rounded-3xl border-4 border-white/30 bg-violet-100"
              />
            ) : (
              <View className="h-24 w-24 items-center justify-center rounded-3xl border-4 border-white/30 bg-white">
                <Text className="text-2xl font-bold text-[#6F3FA0]">
                  {getInitials(member.user.name)}
                </Text>
              </View>
            )}

            <Text className="mt-4 text-center text-2xl font-bold text-white">
              {member.user.name}
            </Text>
            <Text className="mt-1 text-center text-sm text-violet-200">
              {displayValue(member.user.email)}
            </Text>

            <View className="mt-4 flex-row items-center">
              {member.flag && (
                <View className="mr-2 rounded-full bg-white/15 px-3 py-1.5">
                  <Text className="text-xs font-bold text-white">
                    Member {member.flag}
                  </Text>
                </View>
              )}
              <View className="rounded-full bg-white/15 px-3 py-1.5">
                <Text className="text-xs font-bold text-white">
                  {getGenderLabel(member.sex)}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row bg-black/10 px-5 py-4">
            <View className="flex-1 items-center border-r border-white/20">
              <Text className="text-xs text-violet-200">KEY TAG</Text>
              <Text className="mt-1 font-bold text-white">
                {displayValue(member.key_tag_id)}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-xs text-violet-200">T-SHIRT</Text>
              <Text className="mt-1 font-bold text-white">
                {getTshirtSize(member.tshirt_size)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-5 rounded-3xl border border-gray-100 bg-white px-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <View className="border-b border-gray-100 py-5 dark:border-zinc-800">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              Informasi Pribadi
            </Text>
            <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Data identitas dan kontak member
            </Text>
          </View>
          <InformationRow
            icon="call-outline"
            label="Nomor Telepon"
            value={member.phone}
          />
          <InformationRow
            icon="phone-portrait-outline"
            label="Nomor Seluler"
            value={member.cellphone}
          />
          <InformationRow
            icon="calendar-outline"
            label="Tanggal Lahir"
            value={member.birth ? formatDate(member.birth) : null}
          />
          <InformationRow
            icon="person-outline"
            label="Jenis Kelamin"
            value={getGenderLabel(member.sex)}
          />
          <InformationRow
            icon="location-outline"
            label="Alamat"
            value={member.address}
            lines={3}
          />
          <InformationRow
            icon="mail-outline"
            label="Kode Pos"
            value={member.postal}
          />
        </View>

        <View className="mt-5 flex-row items-center rounded-2xl bg-violet-50 p-4 dark:bg-violet-950">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-zinc-900">
            <Ionicons name="calendar" size={22} color="#6F3FA0" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Bergabung sejak
            </Text>
            <Text className="mt-1 font-bold text-[#6F3FA0] dark:text-violet-300">
              {member.joined ? formatDate(member.joined) : "Belum tersedia"}
            </Text>
          </View>
        </View>

        <View className="mb-1 mt-7">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Aktivitas Member
          </Text>
          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Pilih informasi atau tindakan yang dibutuhkan
          </Text>
        </View>

        <View className="mt-4 flex-row flex-wrap justify-between">
          <ActionTile
            icon="barbell-outline"
            title="Workout"
            subtitle="Lihat riwayat workout"
            color="#6F3FA0"
            backgroundColor="#F3E8FF"
            onPress={() =>
              router.push({
                pathname: "/member-history/workout-history",
                params: { id: memberId },
              })
            }
          />
          <ActionTile
            icon="scale-outline"
            title="Weigh & Measure"
            subtitle="Lihat riwayat pengukuran"
            color="#0EA5E9"
            backgroundColor="#E0F2FE"
            onPress={() =>
              router.push({
                pathname: "/member-history/wm-history",
                params: { id: memberId },
              })
            }
          />
          <ActionTile
            icon="add-circle-outline"
            title="Update WM"
            subtitle="Input pengukuran terbaru"
            color="#10B981"
            backgroundColor="#D1FAE5"
            onPress={() =>
              router.push({
                pathname: "/user/input-wm",
                params: { id: memberId },
              })
            }
          />
          <ActionTile
            icon="wallet-outline"
            title="Pembayaran"
            subtitle="Lihat riwayat tagihan"
            color="#6366F1"
            backgroundColor="#E0E7FF"
            onPress={() =>
              router.push({
                pathname: "/member-history/billing-history",
                params: { id: memberId },
              })
            }
          />
        </View>
      </ScrollView>
    </ContainerPage>
  );
}
