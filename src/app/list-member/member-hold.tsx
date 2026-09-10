import ContainerPage from "@/components/ui/container-page";
import { useAuth } from "@/context/auth";
import {
  getMemberHoldClubId,
  type MemberHold,
  useMemberHolds,
} from "@/hooks/useMemberHold";
import { imageProfileURL } from "@/services/image";
import { openWhatsApp } from "@/services/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const PAGE_SIZE = 10;
const SEARCH_DELAY_MS = 400;

const getMemberName = (member: MemberHold) => member.name?.trim() || "Member";

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join("")
    .toLocaleUpperCase("id-ID") || "M";

const formatDate = (value?: string | null) => {
  const date = dayjs(value);
  return value && date.isValid()
    ? date.format("DD MMM YYYY")
    : "Belum tersedia";
};

const getHoldDuration = (member: MemberHold) => {
  if (!member.from_date || !member.thru_date) return "Durasi belum tersedia";

  const start = dayjs(member.from_date).startOf("day");
  const end = dayjs(member.thru_date).startOf("day");
  if (!start.isValid() || !end.isValid()) return "Durasi belum tersedia";

  const today = dayjs().startOf("day");
  if (end.isBefore(today)) return "Masa cuti telah berakhir";
  if (start.isAfter(today)) return `${start.diff(today, "day")} hari lagi`;

  const remainingDays = end.diff(today, "day");
  return remainingDays === 0
    ? "Berakhir hari ini"
    : `Tersisa ${remainingDays} hari`;
};

function MemberAvatar({ member }: { member: MemberHold }) {
  const [hasImageError, setHasImageError] = useState(false);
  const name = getMemberName(member);
  const photo = member.photo?.trim();

  if (photo && !hasImageError) {
    return (
      <Image
        source={{
          uri: /^https?:\/\//i.test(photo) ? photo : imageProfileURL(photo),
        }}
        accessibilityLabel={`Foto profil ${name}`}
        resizeMode="cover"
        onError={() => setHasImageError(true)}
        className="h-16 w-16 rounded-2xl bg-violet-50"
      />
    );
  }

  return (
    <View className="h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 ">
      <Text className="text-xl font-bold text-violet-700 ">
        {getInitials(name)}
      </Text>
    </View>
  );
}

function MemberHoldCard({ member }: { member: MemberHold }) {
  const name = getMemberName(member);
  const hasPhone = Boolean(String(member.phone ?? "").trim());

  return (
    <View className="mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm  ">
      <View className="p-5">
        <View className="flex-row items-start">
          <MemberAvatar
            key={`${member.user_id}-${member.photo}`}
            member={member}
          />
          <View className="ml-4 flex-1">
            <Text
              numberOfLines={2}
              className="text-lg font-bold text-gray-900 "
            >
              {name}
            </Text>
            <View className="mt-2 self-start rounded-full bg-amber-50 px-3 py-1 ">
              <Text className="text-[11px] font-bold text-amber-700 ">
                SEDANG CUTI
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-5 flex-row rounded-2xl bg-violet-50 p-4 ">
          <View className="flex-1 border-r border-violet-200 pr-3 ">
            <Text className="text-[11px] text-gray-500 ">
              MULAI CUTI
            </Text>
            <View className="mt-1.5 flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#6F3FA0" />
              <Text className="ml-2 text-sm font-bold text-gray-800 ">
                {formatDate(member.from_date)}
              </Text>
            </View>
          </View>
          <View className="flex-1 pl-4">
            <Text className="text-[11px] text-gray-500 ">
              SELESAI CUTI
            </Text>
            <View className="mt-1.5 flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#6F3FA0" />
              <Text className="ml-2 text-sm font-bold text-gray-800 ">
                {formatDate(member.thru_date)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-3 flex-row items-center rounded-xl bg-blue-50 px-3 py-2.5 ">
          <Ionicons name="time-outline" size={18} color="#2563EB" />
          <Text className="ml-2 text-sm font-semibold text-blue-700 ">
            {getHoldDuration(member)}
          </Text>
        </View>

        <View className="mt-4">
          <Text className="text-[11px] font-semibold text-gray-400">
            ALASAN CUTI
          </Text>
          <Text className="mt-1 text-sm font-semibold text-gray-700 ">
            {member.member_hold_reason?.trim() || "Alasan belum tersedia"}
          </Text>
          {member.member_hold_note?.trim() ? (
            <Text className="mt-1 text-sm leading-5 text-gray-500 ">
              {member.member_hold_note.trim()}
            </Text>
          ) : null}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          hasPhone
            ? `Hubungi ${name} melalui WhatsApp`
            : `Nomor WhatsApp ${name} belum tersedia`
        }
        accessibilityState={{ disabled: !hasPhone }}
        disabled={!hasPhone}
        onPress={() =>
          void openWhatsApp({
            phoneNumber: member.phone,
            message: `Halo ${name}, semoga kabarnya baik. Kami dari Curves ingin mengajak Anda kembali bergabung dan berlatih bersama setelah masa cuti.`,
          })
        }
        className={`flex-row items-center justify-center py-4 ${
          hasPhone
            ? "bg-green-50 "
            : "bg-gray-50 "
        }`}
      >
        <Ionicons
          name={hasPhone ? "logo-whatsapp" : "call-outline"}
          size={20}
          color={hasPhone ? "#15803D" : "#9CA3AF"}
        />
        <Text
          className={`ml-2 font-bold ${
            hasPhone ? "text-green-700 " : "text-gray-400"
          }`}
        >
          {hasPhone ? "Ajak Bergabung Kembali" : "Nomor belum tersedia"}
        </Text>
      </Pressable>
    </View>
  );
}

export default function MemberHoldScreen() {
  const { user } = useAuth();
  const clubId = getMemberHoldClubId(user?.user_personal?.member_club_id);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(search.trim()),
      SEARCH_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [search]);

  const query = useMemberHolds({
    clubId,
    name: debouncedSearch || undefined,
    limit: PAGE_SIZE,
  });
  const members = useMemo(() => {
    const ids = new Set<string>();
    return (query.data?.pages.flatMap((page) => page.members) ?? []).filter(
      (member) => {
        const id = String(member.user_id);
        if (ids.has(id)) return false;
        ids.add(id);
        return true;
      },
    );
  }, [query.data]);
  const totalMembers = query.data?.pages[0]?.total ?? members.length;
  const isSearching = search.trim() !== debouncedSearch;

  return (
    <ContainerPage
      titleHeader="Member Cuti"
      titleContent="Pantau dan hubungi member yang sedang cuti"
    >
      <FlatList
        data={members}
        keyExtractor={(item) => String(item.user_id)}
        renderItem={({ item }) => <MemberHoldCard member={item} />}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={clubId ? () => void query.refetch() : undefined}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (
            query.hasNextPage &&
            !query.isFetchingNextPage &&
            !query.isFetchNextPageError
          )
            void query.fetchNextPage();
        }}
        ListHeaderComponent={
          <View>
            <View className="mb-4 rounded-3xl bg-[#6F3FA0] p-5">
              <View className="flex-row items-center justify-between">
                <View className="mr-4 flex-1">
                  <Text className="text-sm font-medium text-violet-200">
                    Member yang sedang cuti
                  </Text>
                  <Text className="mt-1 text-3xl font-bold text-white">
                    {query.isLoading ? "—" : totalMembers}
                  </Text>
                  <Text className="mt-1 text-xs text-violet-200">
                    {members.length} dari {totalMembers} member dimuat
                  </Text>
                </View>
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                  <Ionicons name="bed-outline" size={30} color="white" />
                </View>
              </View>
            </View>

            <View className="mb-2 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4  ">
              <Ionicons name="search-outline" size={20} color="#6F3FA0" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                accessibilityLabel="Cari nama member cuti"
                placeholder="Cari nama member..."
                placeholderTextColor="#9CA3AF"
                returnKeyType="search"
                autoCorrect={false}
                className="ml-3 flex-1 py-4 text-gray-900 "
              />
              {search ? (
                <Pressable
                  accessibilityLabel="Hapus pencarian"
                  onPress={() => setSearch("")}
                  className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 "
                >
                  <Ionicons name="close" size={18} color="#6B7280" />
                </Pressable>
              ) : null}
            </View>

            <View className="mb-4 min-h-8 justify-center">
              {isSearching ? (
                <View className="flex-row items-center px-1">
                  <ActivityIndicator size="small" color="#6F3FA0" />
                  <Text className="ml-2 text-xs text-gray-500">
                    Mencari member...
                  </Text>
                </View>
              ) : null}
            </View>

            {members.length ? (
              <View className="mb-4">
                <Text className="text-xl font-bold text-gray-900 ">
                  Daftar Member
                </Text>
                <Text className="mt-1 text-sm text-gray-500 ">
                  Hubungi member menjelang masa cutinya selesai.
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View className="items-center px-8 py-10">
            <View
              className={`mb-4 rounded-full p-5 ${query.isError ? "bg-red-50" : "bg-violet-50 "}`}
            >
              {query.isLoading ? (
                <ActivityIndicator color="#6F3FA0" />
              ) : (
                <Ionicons
                  name={query.isError ? "alert-circle-outline" : "bed-outline"}
                  size={42}
                  color={query.isError ? "#DC2626" : "#6F3FA0"}
                />
              )}
            </View>
            <Text className="text-center text-lg font-bold text-gray-800 ">
              {!clubId
                ? "Club belum tersedia"
                : query.isLoading
                  ? "Memuat member cuti..."
                  : query.isError
                    ? "Data member gagal dimuat"
                    : debouncedSearch
                      ? "Member tidak ditemukan"
                      : "Tidak ada member yang sedang cuti"}
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-gray-500 ">
              {!clubId
                ? "Pastikan akun coach sudah terhubung dengan club."
                : query.isError
                  ? "Periksa koneksi lalu coba muat kembali data."
                  : debouncedSearch
                    ? `Tidak ada member cuti bernama “${debouncedSearch}”.`
                    : "Saat ini seluruh member dapat mengikuti aktivitas club."}
            </Text>
            {query.isError && clubId ? (
              <Pressable
                onPress={() => void query.refetch()}
                className="mt-5 rounded-2xl bg-[#6F3FA0] px-6 py-3"
              >
                <Text className="font-bold text-white">Coba Lagi</Text>
              </Pressable>
            ) : null}
          </View>
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <View className="items-center py-5">
              <ActivityIndicator color="#6F3FA0" />
              <Text className="mt-2 text-xs text-gray-500">
                Memuat member berikutnya...
              </Text>
            </View>
          ) : query.isFetchNextPageError ? (
            <Pressable
              onPress={() => void query.fetchNextPage()}
              className="my-4 items-center rounded-2xl bg-red-50 p-4"
            >
              <Text className="font-bold text-red-700">
                Gagal memuat lanjutan. Coba lagi
              </Text>
            </Pressable>
          ) : members.length ? (
            <Text className="py-4 text-center text-xs text-gray-500">
              {query.hasNextPage
                ? "Scroll untuk memuat member berikutnya."
                : "Semua member telah dimuat."}
            </Text>
          ) : null
        }
      />
    </ContainerPage>
  );
}
