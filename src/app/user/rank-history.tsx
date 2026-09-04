import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import MemberRankCard from "@/components/workout/member-rank-card";
import { useAuth } from "@/context/auth";
import { useMemberRankHistory } from "@/hooks/useMemberRank";
import type { MemberRank } from "@/types/rank";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

interface RankedMember {
  item: MemberRank;
  rank: number;
}

type RankScope = "club" | "monthly";

const LIST_CONTENT_STYLE = {
  paddingHorizontal: 10,
  paddingTop: 28,
  paddingBottom: 48,
  flexGrow: 1,
} as const;

const RankListHeader = ({
  search,
  rankScope,
  currentPeriodLabel,
  onChangeSearch,
  onClearSearch,
  onChangeRankScope,
}: {
  search: string;
  rankScope: RankScope;
  currentPeriodLabel: string;
  onChangeSearch: (value: string) => void;
  onClearSearch: () => void;
  onChangeRankScope: (scope: RankScope) => void;
}) => (
  <View className="mb-6">
    <View className="mb-5 rounded-[28px] bg-purple-50 px-5 py-5">
      <View className="flex-row items-center">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-purple-600">
          <MaterialCommunityIcons
            name="podium-gold"
            size={30}
            color="#FFFFFF"
          />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-xl font-bold text-slate-900">
            Member Transformation
          </Text>
          <Text className="mt-1 text-sm leading-5 text-slate-500">
            Peringkat member berdasarkan pencapaian perubahan tubuh.
          </Text>
        </View>
      </View>
    </View>

    <View className="mb-5 rounded-2xl bg-slate-100 p-1.5">
      <View className="flex-row">
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: rankScope === "monthly" }}
          onPress={() => onChangeRankScope("monthly")}
          className={`flex-1 flex-row items-center justify-center rounded-xl px-3 py-3.5 ${
            rankScope === "monthly" ? "bg-purple-600" : "bg-transparent"
          }`}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={rankScope === "monthly" ? "#FFFFFF" : "#64748B"}
          />
          <Text
            className={`ml-2 text-center text-xs font-bold ${
              rankScope === "monthly" ? "text-white" : "text-slate-500"
            }`}
          >
            Bulan Ini
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: rankScope === "club" }}
          onPress={() => onChangeRankScope("club")}
          className={`ml-1 flex-1 flex-row items-center justify-center rounded-xl px-3 py-3.5 ${
            rankScope === "club" ? "bg-purple-600" : "bg-transparent"
          }`}
        >
          <Ionicons
            name="people-outline"
            size={18}
            color={rankScope === "club" ? "#FFFFFF" : "#64748B"}
          />
          <Text
            className={`ml-2 text-center text-xs font-bold ${
              rankScope === "club" ? "text-white" : "text-slate-500"
            }`}
          >
            Peringkat Club
          </Text>
        </Pressable>
      </View>

      <Text className="px-3 pb-1 pt-2 text-center text-xs text-slate-500">
        {rankScope === "club"
          ? "Peringkat keseluruhan member di club Anda"
          : `Peringkat periode ${currentPeriodLabel}`}
      </Text>
    </View>

    <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4">
      <Ionicons name="search-outline" size={22} color="#94A3B8" />
      <TextInput
        value={search}
        onChangeText={onChangeSearch}
        placeholder="Cari nama member atau club..."
        placeholderTextColor="#94A3B8"
        className="ml-3 flex-1 py-4 text-base text-slate-800"
      />
      {search.length > 0 && (
        <Pressable
          accessibilityLabel="Hapus pencarian"
          hitSlop={8}
          onPress={onClearSearch}
        >
          <Ionicons name="close-circle" size={21} color="#94A3B8" />
        </Pressable>
      )}
    </View>
  </View>
);

const EmptyRank = ({ isSearching }: { isSearching: boolean }) => (
  <View className="flex-1 items-center justify-center px-8 pb-24">
    <View className="h-24 w-24 items-center justify-center rounded-full bg-purple-50">
      <MaterialCommunityIcons name="podium" size={48} color="#9333EA" />
    </View>
    <Text className="mt-6 text-center text-xl font-bold text-slate-900">
      {isSearching ? "Member tidak ditemukan" : "Belum ada peringkat"}
    </Text>
    <Text className="mt-3 text-center text-sm leading-6 text-slate-500">
      {isSearching
        ? "Coba gunakan nama member atau nama club yang berbeda."
        : "Data perubahan tubuh member akan tampil setelah proses pengukuran selesai."}
    </Text>
  </View>
);

export default function RankHistoryScreen() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [rankScope, setRankScope] = useState<RankScope>("monthly");
  const rawClubId = user?.user_personal?.member_club_id;
  const clubId =
    typeof rawClubId === "string"
      ? rawClubId
      : rawClubId && typeof rawClubId === "object" && "_id" in rawClubId
        ? String(rawClubId._id)
        : undefined;
  const currentPeriodLabel = useMemo(() => {
    const now = new Date();

    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(now);
  }, []);
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useMemberRankHistory(clubId, rankScope);

  const rankedMembers = useMemo<RankedMember[]>(() => {
    const keyword = search.trim().toLowerCase();
    const members = data?.pages.flat() ?? [];

    return members
      .map((item, index) => ({ item, rank: index + 1 }))
      .filter(({ item }) => {
        if (!keyword) return true;

        return [item.user.name, item.user.email, item.club.club_name].some(
          (value) => value.toLowerCase().includes(keyword),
        );
      });
  }, [data, search]);

  const handleEndReached = useCallback((): void => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const clearSearch = useCallback((): void => setSearch(""), []);

  const changeRankScope = useCallback((scope: RankScope): void => {
    setRankScope(scope);
    setSearch("");
  }, []);

  const renderRank: ListRenderItem<RankedMember> = useCallback(
    ({ item }) => <MemberRankCard item={item.item} rank={item.rank} />,
    [],
  );

  if (isLoading) return <LoadingView />;

  return (
    <ContainerPage titleHeader="Rank Member" titleContent={user.name}>
      <FlatList
        data={rankedMembers}
        renderItem={renderRank}
        keyExtractor={({ item }) => item._id}
        ListHeaderComponent={
          <RankListHeader
            search={search}
            rankScope={rankScope}
            currentPeriodLabel={currentPeriodLabel}
            onChangeSearch={setSearch}
            onClearSearch={clearSearch}
            onChangeRankScope={changeRankScope}
          />
        }
        ListEmptyComponent={
          !clubId ? (
            <View className="items-center px-8 py-16">
              <Ionicons name="business-outline" size={46} color="#94A3B8" />
              <Text className="mt-4 text-center text-lg font-bold text-slate-800">
                Club belum tersedia
              </Text>
              <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                Akun coach belum memiliki member_club_id sehingga peringkat
                belum dapat ditampilkan.
              </Text>
            </View>
          ) : error ? (
            <View className="items-center px-8 py-16">
              <Text className="text-center text-base text-red-500">
                {error.message || "Gagal memuat data peringkat."}
              </Text>
              <Pressable
                onPress={() => void refetch()}
                className="mt-5 rounded-xl bg-purple-600 px-5 py-3"
              >
                <Text className="font-semibold text-white">Coba lagi</Text>
              </Pressable>
            </View>
          ) : (
            <EmptyRank isSearching={search.trim().length > 0} />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              size="small"
              color="#9333EA"
              style={{ marginVertical: 20 }}
            />
          ) : null
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={() => void refetch()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={LIST_CONTENT_STYLE}
        keyboardShouldPersistTaps="handled"
      />
    </ContainerPage>
  );
}
