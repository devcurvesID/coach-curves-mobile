import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import { useAuth } from "@/context/auth";
import { Member, useInfiniteMembers } from "@/hooks/useMember";
import { imageProfileURL } from "@/services/image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const getClubId = (club: unknown): string | undefined => {
  if (typeof club === "string") return club;
  if (club && typeof club === "object" && "_id" in club) {
    const id = (club as { _id?: unknown })._id;
    return typeof id === "string" ? id : undefined;
  }
  return undefined;
};

const displayValue = (value?: string | number | null): string => {
  if (value === null || value === undefined) return "-";

  const normalizedValue = String(value).trim();
  return normalizedValue || "-";
};

const getDaysSinceJoining = (joined?: string | null): number | null => {
  if (!joined) return null;

  const joinedDate = moment(joined).startOf("day");
  if (!joinedDate.isValid()) return null;

  return moment().startOf("day").diff(joinedDate, "days");
};

function MemberAvatar({ member }: { member: Member }) {
  if (member.photo) {
    return (
      <Image
        source={{ uri: imageProfileURL(member.photo) }}
        className="h-16 w-16 rounded-2xl bg-violet-100"
      />
    );
  }

  return (
    <View className="h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950">
      <Text className="text-xl font-bold text-[#6F3FA0]">
        {getInitials(member.user.name)}
      </Text>
    </View>
  );
}

function InfoRow({
  icon,
  value,
  lines = 1,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value?: string | number | null;
  lines?: number;
}) {
  return (
    <View className="flex-row items-start">
      <Ionicons name={icon} size={18} color="#6F3FA0" />
      <Text
        numberOfLines={lines}
        className="ml-3 flex-1 text-sm text-gray-600 dark:text-gray-300"
      >
        {displayValue(value)}
      </Text>
    </View>
  );
}

interface MemberCardProps {
  member: Member;
  onDetail: () => void;
}

function MemberCard({ member, onDetail }: MemberCardProps) {
  const gender =
    member.sex === "F"
      ? "Perempuan"
      : member.sex === "M"
        ? "Laki-laki"
        : "Tidak diketahui";
  const daysSinceJoining = getDaysSinceJoining(member.joined);
  const isNewMember =
    daysSinceJoining !== null && daysSinceJoining >= 0 && daysSinceJoining < 30;

  return (
    <View className="mx-5 mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <View className="p-5">
        <View className="flex-row items-start">
          <MemberAvatar member={member} />
          <View className="ml-4 flex-1">
            <View className="flex-row items-start justify-between">
              <View className="mr-2 flex-1">
                <Text
                  numberOfLines={1}
                  className="text-lg font-bold text-gray-900 dark:text-white"
                >
                  {member.user.name}
                </Text>
                <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {gender}
                  {member.flag ? ` • Member ${member.flag}` : ""}
                </Text>
              </View>
              <View className="rounded-full bg-green-50 px-2.5 py-1 dark:bg-green-950">
                <Text className="text-[10px] font-bold text-green-700 dark:text-green-300">
                  AKTIF
                </Text>
              </View>
            </View>
            <View className="mt-3 self-start rounded-lg bg-violet-50 px-2.5 py-1 dark:bg-violet-950">
              <Text className="text-xs font-semibold text-[#6F3FA0] dark:text-violet-300">
                Key Tag: {displayValue(member.key_tag_id)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-5 gap-3 border-t border-gray-100 pt-4 dark:border-zinc-800">
          <InfoRow icon="mail-outline" value={member.user.email} />
          <InfoRow icon="call-outline" value={member.phone} />
          <InfoRow icon="location-outline" value={member.address} lines={2} />
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={18} color="#6F3FA0" />
            <Text className="ml-3 flex-1 text-sm text-gray-600 dark:text-gray-300">
              {member.joined
                ? `Bergabung ${moment(member.joined).format("DD MMM YYYY")}`
                : "-"}
            </Text>
            {isNewMember && (
              <View
                accessibilityLabel={`Member baru, bergabung ${daysSinceJoining === 0 ? "hari ini" : `${daysSinceJoining} hari lalu`}`}
                className="ml-2 flex-row items-center rounded-full bg-pink-50 px-2.5 py-1 dark:bg-pink-950"
              >
                <Ionicons name="sparkles" size={12} color="#DB2777" />
                <Text className="ml-1 text-[10px] font-bold text-pink-600 dark:text-pink-300">
                  MEMBER BARU
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className="border-t border-gray-100 dark:border-zinc-800">
        <TouchableOpacity onPress={onDetail} className="items-center py-4">
          <Text className="font-bold text-[#6F3FA0]">Lihat Detail</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ListMemberScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const clubId = getClubId(user?.club_id?.[0]);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(search.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteMembers({ clubId, name: debouncedSearch, limit: PAGE_SIZE });

  const members = useMemo(() => {
    const uniqueMembers = new Map<string, Member>();
    data?.pages.forEach((page) => {
      page.members.forEach((member) => {
        const memberId = member._id || member.user_id;
        if (!uniqueMembers.has(memberId)) uniqueMembers.set(memberId, member);
      });
    });
    return Array.from(uniqueMembers.values());
  }, [data]);
  const isSearching = isFetching && !isFetchingNextPage && Boolean(search);

  const openDetail = (member: Member) => {
    router.push({
      pathname: "/list-member/info/[id]",
      params: { id: member.user_id },
    });
  };

  if (isLoading && members.length === 0 && !search) return <LoadingView />;

  return (
    <ContainerPage titleHeader="List Member" titleContent="Member">
      <View className="mx-5 mb-3 mt-4">
        <View className="flex-row items-center rounded-2xl border border-gray-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <Ionicons name="search-outline" size={22} color="#9CA3AF" />
          <TextInput
            placeholder="Cari nama member..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            returnKeyType="search"
            className="ml-3 flex-1 text-base text-gray-800 dark:text-white"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        {isSearching ? (
          <View className="mt-3 flex-row items-center">
            <ActivityIndicator size="small" color="#6F3FA0" />
            <Text className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              Mencari member...
            </Text>
          </View>
        ) : (
          <Text className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {members.length} member ditampilkan
          </Text>
        )}
      </View>

      <FlatList
        data={members}
        keyExtractor={(member) => member._id || member.user_id}
        renderItem={({ item }) => (
          <MemberCard member={item} onDetail={() => openDetail(item)} />
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetching) void fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        refreshing={isLoading}
        onRefresh={() => void refetch()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 4,
          paddingBottom: 120,
          flexGrow: 1,
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color="#6F3FA0" className="py-5" />
          ) : null
        }
        ListEmptyComponent={
          isSearching ? null : (
            <View className="flex-1 items-center justify-center px-8 pb-20">
              <View className="mb-4 rounded-full bg-violet-50 p-5 dark:bg-violet-950">
                <Ionicons name="people-outline" size={40} color="#6F3FA0" />
              </View>
              <Text className="text-center text-lg font-bold text-gray-800 dark:text-white">
                {error ? "Member gagal dimuat" : "Member tidak ditemukan"}
              </Text>
              <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                {error
                  ? "Tarik layar ke bawah untuk mencoba kembali."
                  : debouncedSearch
                    ? `Tidak ada hasil untuk “${debouncedSearch}”.`
                    : "Belum ada member pada club ini."}
              </Text>
            </View>
          )
        }
      />
    </ContainerPage>
  );
}
