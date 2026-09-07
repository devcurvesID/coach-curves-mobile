import ContainerPage from "@/components/ui/container-page";
import { useAuth } from "@/context/auth";
import {
  getNonMemberClubId,
  type NonMember,
  type NonMemberStatus,
  useNonMemberStatus,
} from "@/hooks/useNonMemberStatus";
import { imageProfileURL } from "@/services/image";
import { openWhatsApp } from "@/services/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const SEARCH_DELAY_MS = 350;

const STATUS_CONFIG = {
  Inactive: {
    label: "Inactive",
    description: "Member yang sedang tidak aktif",
    icon: "pause-circle-outline" as const,
  },
  Stopped: {
    label: "Stop",
    description: "Member yang sudah berhenti",
    icon: "stop-circle-outline" as const,
  },
};

const getMemberName = (member: NonMember) => member.name?.trim() || "Member";

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
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : "Belum tersedia";
};

function MemberAvatar({ member }: { member: NonMember }) {
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
    <View className="h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950">
      <Text className="text-xl font-bold text-violet-700 dark:text-violet-300">
        {getInitials(name)}
      </Text>
    </View>
  );
}

function MemberCard({ member }: { member: NonMember }) {
  const name = getMemberName(member);
  const isStopped = member.status === "Stopped";
  const hasPhone = Boolean(String(member.phone ?? "").trim());

  return (
    <View className="mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <View className="p-5">
        <View className="flex-row items-start">
          <MemberAvatar
            key={`${member.user_id}-${member.photo}`}
            member={member}
          />
          <View className="ml-4 flex-1">
            <Text
              numberOfLines={2}
              className="text-lg font-bold text-gray-900 dark:text-white"
            >
              {name}
            </Text>
            <View
              className={`mt-2 self-start rounded-full px-3 py-1 ${
                isStopped
                  ? "bg-red-50 dark:bg-red-950"
                  : "bg-amber-50 dark:bg-amber-950"
              }`}
            >
              <Text
                className={`text-[11px] font-bold ${
                  isStopped
                    ? "text-red-700 dark:text-red-300"
                    : "text-amber-700 dark:text-amber-300"
                }`}
              >
                {isStopped ? "STOP" : "INACTIVE"}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-5 flex-row rounded-2xl bg-violet-50 p-4 dark:bg-violet-950">
          <View className="flex-1 border-r border-violet-200 pr-3 dark:border-violet-800">
            <Text className="text-[11px] text-gray-500 dark:text-gray-400">
              MULAI STATUS
            </Text>
            <View className="mt-1.5 flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#6F3FA0" />
              <Text className="ml-2 text-sm font-bold text-gray-800 dark:text-white">
                {formatDate(member.from_date)}
              </Text>
            </View>
          </View>
          <View className="flex-1 pl-4">
            <Text className="text-[11px] text-gray-500 dark:text-gray-400">
              SAMPAI
            </Text>
            <View className="mt-1.5 flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#6F3FA0" />
              <Text className="ml-2 text-sm font-bold text-gray-800 dark:text-white">
                {formatDate(member.thru_date)}
              </Text>
            </View>
          </View>
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
            message: `Halo ${name}, kami dari Curves ingin mengajak Anda bergabung kembali. Apakah Anda berkenan mendapatkan informasi lebih lanjut?`,
          })
        }
        className={`flex-row items-center justify-center py-4 ${
          hasPhone
            ? "bg-green-50 dark:bg-green-950"
            : "bg-gray-50 dark:bg-zinc-800"
        }`}
      >
        <Ionicons
          name={hasPhone ? "logo-whatsapp" : "call-outline"}
          size={20}
          color={hasPhone ? "#15803D" : "#9CA3AF"}
        />
        <Text
          className={`ml-2 font-bold ${
            hasPhone ? "text-green-700 dark:text-green-300" : "text-gray-400"
          }`}
        >
          {hasPhone ? "Hubungi via WhatsApp" : "Nomor belum tersedia"}
        </Text>
      </Pressable>
    </View>
  );
}

export default function NonMemberStatusScreen() {
  const { user } = useAuth();
  const clubId = getNonMemberClubId(user?.user_personal?.member_club_id);
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 25 }, (_, index) => currentYear - index),
    [currentYear],
  );
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [status, setStatus] = useState<NonMemberStatus>("Inactive");
  const [filters, setFilters] = useState({
    Inactive: { year: currentYear, search: "" },
    Stopped: { year: currentYear, search: "" },
  });
  const { year, search } = filters[status];
  const [debouncedSearch, setDebouncedSearch] = useState({ status, name: "" });

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch({ status, name: search.trim() }),
      SEARCH_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [status, search]);

  const name =
    debouncedSearch.status === status ? debouncedSearch.name : search.trim();
  const query = useNonMemberStatus(clubId, status, year, name);
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
  const statusConfig = STATUS_CONFIG[status];

  const updateFilter = (patch: Partial<(typeof filters)["Inactive"]>) => {
    setFilters((previous) => ({
      ...previous,
      [status]: { ...previous[status], ...patch },
    }));
  };

  const listHeader = (
    <View>
      <View className="mb-4 flex-row gap-3">
        {(Object.keys(STATUS_CONFIG) as NonMemberStatus[]).map((option) => {
          const selected = option === status;
          return (
            <Pressable
              key={option}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setStatus(option)}
              className={`flex-1 flex-row items-center justify-center rounded-2xl border py-3.5 ${
                selected
                  ? "border-[#6F3FA0] bg-[#6F3FA0]"
                  : "border-violet-100 bg-violet-50 dark:border-violet-900 dark:bg-violet-950"
              }`}
            >
              <Ionicons
                name={STATUS_CONFIG[option].icon}
                size={19}
                color={selected ? "white" : "#6F3FA0"}
              />
              <Text
                className={`ml-2 font-bold ${selected ? "text-white" : "text-violet-700 dark:text-violet-300"}`}
              >
                {STATUS_CONFIG[option].label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mb-4 rounded-3xl bg-[#6F3FA0] p-5">
        <View className="flex-row items-center justify-between">
          <View className="mr-4 flex-1">
            <Text className="text-sm font-medium text-violet-200">
              {statusConfig.description}
            </Text>
            <Text className="mt-1 text-3xl font-bold text-white">
              {query.isLoading ? "—" : totalMembers}
            </Text>
            <Text className="mt-1 text-xs text-violet-200">
              {members.length} dari {totalMembers} member dimuat
            </Text>
          </View>
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Ionicons name={statusConfig.icon} size={30} color="white" />
          </View>
        </View>
      </View>

      <View className="mb-4 flex-row items-center justify-between rounded-2xl bg-gray-50 p-3 dark:bg-zinc-900">
        <Pressable
          accessibilityLabel="Tahun sebelumnya"
          onPress={() => updateFilter({ year: year - 1 })}
          className="h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-zinc-800"
        >
          <Ionicons name="chevron-back" size={22} color="#6F3FA0" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Pilih tahun, saat ini ${year}`}
          onPress={() => setYearPickerOpen(true)}
          className="flex-row items-center px-5 py-2"
        >
          <Ionicons name="calendar-outline" size={18} color="#6F3FA0" />
          <Text className="mx-2 font-bold text-gray-800 dark:text-white">
            Tahun {year}
          </Text>
          <Ionicons name="chevron-down" size={17} color="#6F3FA0" />
        </Pressable>
        <Pressable
          accessibilityLabel="Tahun berikutnya"
          disabled={year >= currentYear}
          onPress={() => updateFilter({ year: year + 1 })}
          className="h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-zinc-800"
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={year >= currentYear ? "#CBD5E1" : "#6F3FA0"}
          />
        </Pressable>
      </View>

      <View className="mb-2 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 dark:border-zinc-700 dark:bg-zinc-900">
        <Ionicons name="search-outline" size={20} color="#6F3FA0" />
        <TextInput
          accessibilityLabel="Cari nama member"
          placeholder="Cari nama member..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={(value) => updateFilter({ search: value })}
          className="ml-3 flex-1 py-4 text-gray-900 dark:text-white"
        />
        {search ? (
          <Pressable
            accessibilityLabel="Hapus pencarian"
            onPress={() => updateFilter({ search: "" })}
            className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800"
          >
            <Ionicons name="close" size={18} color="#6B7280" />
          </Pressable>
        ) : null}
      </View>

      <View className="mb-4 min-h-8 justify-center">
        {search.trim() !== name ? (
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
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Daftar Member
          </Text>
          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Member {statusConfig.label.toLowerCase()} tahun {year}
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <ContainerPage
      titleHeader="Member Inactive & Stop"
      titleContent="Hubungi member untuk bergabung kembali"
    >
      <FlatList
        key={`${status}-${year}-${name}`}
        data={members}
        keyExtractor={(item) => String(item.user_id)}
        renderItem={({ item }) => <MemberCard member={item} />}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={clubId ? () => void query.refetch() : undefined}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (
            query.hasNextPage &&
            !query.isFetching &&
            !query.isFetchNextPageError
          )
            void query.fetchNextPage();
        }}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View className="items-center px-8 py-10">
            <View
              className={`mb-4 rounded-full p-5 ${query.isError ? "bg-red-50" : "bg-violet-50 dark:bg-violet-950"}`}
            >
              {query.isLoading ? (
                <ActivityIndicator color="#6F3FA0" />
              ) : (
                <Ionicons
                  name={
                    query.isError ? "alert-circle-outline" : "people-outline"
                  }
                  size={42}
                  color={query.isError ? "#DC2626" : "#6F3FA0"}
                />
              )}
            </View>
            <Text className="text-center text-lg font-bold text-gray-800 dark:text-white">
              {!clubId
                ? "Club belum tersedia"
                : query.isLoading
                  ? "Memuat daftar member..."
                  : query.isError
                    ? "Data member gagal dimuat"
                    : name
                      ? "Member tidak ditemukan"
                      : `Belum ada member ${statusConfig.label}`}
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-gray-500 dark:text-gray-400">
              {!clubId
                ? "Pastikan akun coach sudah terhubung dengan club."
                : query.isError
                  ? "Periksa koneksi lalu coba muat kembali data."
                  : name
                    ? `Tidak ada member bernama “${name}” pada tahun ${year}.`
                    : `Tidak ada member berstatus ${statusConfig.label} pada tahun ${year}.`}
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

      <Modal
        visible={yearPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setYearPickerOpen(false)}
      >
        <View className="flex-1 justify-center bg-black/50 px-6">
          <Pressable
            className="absolute inset-0"
            onPress={() => setYearPickerOpen(false)}
          />
          <View
            accessibilityViewIsModal
            className="rounded-3xl bg-white p-5 dark:bg-zinc-900"
            style={{ maxHeight: 520 }}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  Pilih Tahun
                </Text>
                <Text className="mt-1 text-xs text-gray-500">
                  Tampilkan riwayat berdasarkan tahun
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Tutup pilihan tahun"
                onPress={() => setYearPickerOpen(false)}
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800"
              >
                <Ionicons name="close" size={21} color="#6F3FA0" />
              </Pressable>
            </View>
            <FlatList
              data={years}
              keyExtractor={(item) => String(item)}
              style={{ maxHeight: 420 }}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityState={{ selected: item === year }}
                  onPress={() => {
                    updateFilter({ year: item });
                    setYearPickerOpen(false);
                  }}
                  className={`h-[52px] flex-row items-center justify-between rounded-xl px-4 ${
                    item === year
                      ? "bg-violet-50 dark:bg-violet-950"
                      : "bg-white dark:bg-zinc-900"
                  }`}
                >
                  <Text
                    className={
                      item === year
                        ? "font-bold text-violet-700 dark:text-violet-300"
                        : "text-gray-700 dark:text-gray-300"
                    }
                  >
                    {item}
                  </Text>
                  {item === year ? (
                    <Ionicons name="checkmark" size={22} color="#6F3FA0" />
                  ) : null}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </ContainerPage>
  );
}
