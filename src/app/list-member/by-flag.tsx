import ContainerPage from "@/components/ui/container-page";
import { useAuth } from "@/context/auth";
import {
  MEMBER_FLAG_OPTIONS,
  type MemberFlag,
} from "@/helpers/member-flag-options";
import { useMembersByFlag } from "@/hooks/useMembersByFlag";
import type { MemberByFlag } from "@/hooks/useMembersByFlag";
import { imageProfileURL } from "@/services/image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const getMemberName = (member: MemberByFlag): string =>
  member.name?.trim() || member.user?.name?.trim() || "Member";

const getMemberUserId = (member: MemberByFlag): string | undefined =>
  member.user_id?.trim() || member.user?._id?.trim() || undefined;

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join("")
    .toLocaleUpperCase("id-ID") || "M";

function MemberFlagAvatar({
  name,
  photo,
}: {
  name: string;
  photo?: string | null;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const filename = photo?.trim();

  if (filename && !hasImageError) {
    return (
      <Image
        accessibilityLabel={`Foto profil ${name}`}
        source={{ uri: imageProfileURL(filename) }}
        resizeMode="cover"
        onError={() => setHasImageError(true)}
        className="h-14 w-14 rounded-2xl bg-purple-50"
      />
    );
  }

  return (
    <View
      accessibilityLabel={`Inisial ${name}`}
      className="h-14 w-14 items-center justify-center rounded-2xl bg-purple-100"
    >
      <Text className="text-lg font-bold text-purple-700">
        {getInitials(name)}
      </Text>
    </View>
  );
}

export default function MemberFlagsScreen() {
  const { user } = useAuth();
  const club = user?.club_id?.[0];
  const clubId = typeof club === "string" ? club : club?._id;
  const [flag, setFlag] = useState<MemberFlag["flag"]>("A");
  const [search, setSearch] = useState("");
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useMembersByFlag(clubId, flag);
  const loadedMembers = useMemo(
    () => data?.pages.flatMap((page) => page.members) ?? [],
    [data],
  );
  const total = data?.pages[0]?.total;
  const selectedFlag = MEMBER_FLAG_OPTIONS.find(
    (option) => option.flag === flag,
  )!;
  const members = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("id-ID");
    return loadedMembers.filter((member) =>
      getMemberName(member).toLocaleLowerCase("id-ID").includes(keyword),
    );
  }, [loadedMembers, search]);
  const hasClub = clubId !== undefined && clubId !== null && clubId !== "";

  return (
    <ContainerPage
      titleHeader="Member Berdasarkan Flag"
      titleContent="Aktivitas member di club Anda"
    >
      <FlatList
        data={members}
        keyExtractor={(item, index) =>
          `${item._id ?? item.user?._id ?? item.source_id ?? "member"}-${index}`
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48, flexGrow: 1 }}
        refreshing={isFetching && !isLoading && !isFetchingNextPage}
        onRefresh={hasClub ? () => void refetch() : undefined}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetching && !isFetchNextPageError)
            void fetchNextPage();
        }}
        ListHeaderComponent={
          <View>
            <View className="mb-5 flex-row gap-2">
              {MEMBER_FLAG_OPTIONS.map((option) => (
                <Pressable
                  key={option.flag}
                  accessibilityRole="tab"
                  accessibilityLabel={`Flag ${option.flag}, ${option.description}`}
                  accessibilityState={{ selected: flag === option.flag }}
                  onPress={() => {
                    setFlag(option.flag);
                    setSearch("");
                  }}
                  className="flex-1 items-center rounded-2xl border py-3"
                  style={{
                    backgroundColor:
                      flag === option.flag ? option.backgroundColor : "#FFFFFF",
                    borderColor:
                      flag === option.flag ? option.color : "#E2E8F0",
                  }}
                >
                  <Text className="text-xs text-slate-500">Flag</Text>
                  <Text
                    className="mt-1 text-xl font-bold"
                    style={{ color: option.color }}
                  >
                    {option.flag}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View
              className="mb-5 rounded-3xl p-5"
              style={{ backgroundColor: selectedFlag.backgroundColor }}
            >
              <View className="flex-row items-center">
                <Ionicons name="flag" size={26} color={selectedFlag.color} />
                <Text className="ml-3 text-lg font-bold text-slate-800">
                  Member Flag {flag}
                </Text>
              </View>
              <Text className="mt-2 text-sm text-slate-600">
                {selectedFlag.description}
              </Text>
              {!isLoading && !error && hasClub && (
                <Text className="mt-2 text-sm font-semibold text-slate-700">
                  {total !== undefined
                    ? `${loadedMembers.length} dari ${total} member dimuat`
                    : `${loadedMembers.length} member dimuat`}
                </Text>
              )}
            </View>
            <View className="mb-5 flex-row items-center rounded-2xl border border-slate-200 px-4">
              <Ionicons name="search-outline" size={20} color="#94A3B8" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Cari nama pada daftar dimuat..."
                className="ml-2 flex-1 py-4 text-slate-800"
              />
              {search.length > 0 && (
                <Pressable
                  accessibilityLabel="Hapus pencarian"
                  hitSlop={8}
                  onPress={() => setSearch("")}
                >
                  <Ionicons name="close-circle" size={20} color="#94A3B8" />
                </Pressable>
              )}
            </View>
            {search.trim() && hasNextPage ? (
              <Text className="mb-4 text-xs text-slate-500">
                Pencarian mencakup member yang sudah dimuat. Muat halaman
                berikutnya untuk mencari lebih banyak member.
              </Text>
            ) : null}
            {error && loadedMembers.length > 0 && !isFetchNextPageError ? (
              <Pressable
                onPress={() => void refetch()}
                className="mb-4 rounded-xl bg-red-50 p-3"
              >
                <Text className="text-sm text-red-700">
                  Pembaruan gagal. Ketuk untuk mencoba kembali.
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Lihat detail ${getMemberName(item)}`}
            accessibilityState={{ disabled: !getMemberUserId(item) }}
            disabled={!getMemberUserId(item)}
            onPress={() => {
              const userId = getMemberUserId(item);
              if (!userId) return;
              router.push({
                pathname: "/list-member/info/[id]",
                params: { id: userId },
              });
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            className="mb-3 flex-row items-center rounded-2xl border border-slate-100 bg-white p-4"
          >
            <MemberFlagAvatar
              key={item.photo ?? "no-photo"}
              name={getMemberName(item)}
              photo={item.photo}
            />
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-slate-800">
                {getMemberName(item)}
              </Text>
              <View className="mt-2 flex-row items-center">
                <Ionicons name="key-outline" size={14} color="#6F3FA0" />
                <Text className="ml-1.5 flex-1 text-xs text-slate-500">
                  Key Tag: {String(item.key_tag_id ?? "").trim() || "-"}
                </Text>
              </View>
              <Text className="mt-2 text-xs text-purple-700">
                {getMemberUserId(item)
                  ? "Lihat detail member"
                  : "ID user member belum tersedia"}
              </Text>
            </View>
            <View
              className="ml-2 rounded-full px-3 py-2"
              style={{ backgroundColor: selectedFlag.backgroundColor }}
            >
              <Text className="text-xs font-bold text-slate-800">
                Flag {flag}
              </Text>
            </View>
            {getMemberUserId(item) ? (
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#6F3FA0"
                style={{ marginLeft: 8 }}
              />
            ) : null}
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="items-center px-5 py-10">
            {isLoading ? (
              <ActivityIndicator color="#6F3FA0" />
            ) : (
              <Ionicons
                name={error ? "alert-circle-outline" : "people-outline"}
                size={42}
                color="#9333EA"
              />
            )}
            <Text className="mt-4 text-center text-base font-semibold text-slate-700">
              {!hasClub
                ? "Club user belum tersedia."
                : isLoading
                  ? "Memuat daftar member..."
                  : error
                    ? error.message
                    : search.trim()
                      ? "Member tidak ditemukan pada daftar yang sudah dimuat."
                      : `Belum ada member dengan flag ${flag}.`}
            </Text>
            {error && hasClub && (
              <Pressable
                onPress={() => void refetch()}
                className="mt-4 rounded-xl bg-purple-600 px-5 py-3"
              >
                <Text className="font-semibold text-white">Coba Lagi</Text>
              </Pressable>
            )}
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="items-center py-5">
              <ActivityIndicator color="#6F3FA0" />
              <Text className="mt-2 text-xs text-slate-500">
                Memuat member berikutnya...
              </Text>
            </View>
          ) : hasNextPage || isFetchNextPageError ? (
            <Pressable
              accessibilityRole="button"
              disabled={isFetching}
              onPress={() => void fetchNextPage()}
              className="my-4 items-center rounded-xl bg-purple-50 px-4 py-4"
            >
              <Text className="font-semibold text-purple-700">
                {isFetchNextPageError
                  ? "Gagal memuat lanjutan. Coba lagi"
                  : "Muat Member Berikutnya"}
              </Text>
            </Pressable>
          ) : loadedMembers.length > 0 ? (
            <Text className="py-4 text-center text-xs text-slate-500">
              Semua member flag {flag} telah dimuat.
            </Text>
          ) : null
        }
      />
    </ContainerPage>
  );
}
