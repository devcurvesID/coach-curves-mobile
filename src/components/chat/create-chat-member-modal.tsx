import { useAuth } from "@/context/auth";
import { type Member, useInfiniteMembers } from "@/hooks/useMember";
import { imageProfileURL } from "@/services/image";
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
import { SafeAreaView } from "react-native-safe-area-context";

interface CreateChatMemberModalProps {
  isCreating?: boolean;
  onCancel: () => void;
  onSelectMember: (member: Member) => void | Promise<void>;
  selectedMemberId?: string | null;
  visible: boolean;
}

const PAGE_SIZE = 10;
const SEARCH_DELAY_MS = 400;

const getClubId = (value: unknown): string | undefined => {
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (value && typeof value === "object" && "_id" in value) {
    return getClubId(value._id);
  }
  return undefined;
};

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("") || "?";

const MemberAvatar = ({ member }: { member: Member }) => {
  const [hasImageError, setHasImageError] = useState(false);

  if (member.photo && !hasImageError) {
    return (
      <Image
        source={{ uri: imageProfileURL(member.user.name, member.photo) }}
        onError={() => setHasImageError(true)}
        className="h-13 w-13 rounded-full bg-purple-100"
        style={{ width: 52, height: 52 }}
      />
    );
  }

  return (
    <View className="h-13 w-13 items-center justify-center rounded-full bg-purple-100">
      <Text className="font-black text-purple-700">
        {getInitials(member.user.name)}
      </Text>
    </View>
  );
};

export const CreateChatMemberModal = ({
  isCreating = false,
  onCancel,
  onSelectMember,
  selectedMemberId,
  visible,
}: CreateChatMemberModalProps) => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const clubId =
    getClubId(user?.user_personal?.member_club_id) ??
    getClubId(user?.club_id?.[0]);

  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedSearch(search.trim()),
      SEARCH_DELAY_MS,
    );
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (!visible) {
      setSearch("");
      setDebouncedSearch("");
    }
  }, [visible]);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteMembers({
    clubId: visible ? clubId : undefined,
    name: debouncedSearch,
    limit: PAGE_SIZE,
  });

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
  const isSearching =
    isFetching && !isFetchingNextPage && Boolean(debouncedSearch);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-row items-center border-b border-slate-200 bg-white px-5 py-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tutup daftar member"
            onPress={onCancel}
            className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"
          >
            <Ionicons name="close" size={22} color="#475569" />
          </Pressable>
          <View className="ml-3 flex-1">
            <Text className="text-lg font-black text-slate-900">
              Buat Chat Baru
            </Text>
            <Text className="mt-0.5 text-xs text-slate-500">
              Pilih member yang ingin dihubungi
            </Text>
          </View>
        </View>

        <View className="border-b border-slate-100 bg-white px-5 pb-4 pt-3">
          <View className="flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-4">
            <Ionicons name="search-outline" size={21} color="#94A3B8" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Cari nama member..."
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              returnKeyType="search"
              className="ml-3 flex-1 py-3.5 text-base text-slate-800"
            />
            {search ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Hapus pencarian"
                onPress={() => setSearch("")}
              >
                <Ionicons name="close-circle" size={20} color="#94A3B8" />
              </Pressable>
            ) : null}
          </View>
          <View className="mt-2 min-h-5 flex-row items-center">
            {isSearching ? (
              <>
                <ActivityIndicator size="small" color="#6F3FA0" />
                <Text className="ml-2 text-xs text-slate-500">
                  Mencari member...
                </Text>
              </>
            ) : (
              <Text className="text-xs text-slate-500">
                {members.length} member ditampilkan
              </Text>
            )}
          </View>
        </View>

        <FlatList
          data={members}
          keyExtractor={(member) => member._id || member.user_id}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Pilih ${item.user.name} untuk chat`}
              accessibilityState={{ disabled: isCreating }}
              disabled={isCreating}
              onPress={() => void onSelectMember(item)}
              className={`mx-5 mb-3 flex-row items-center rounded-2xl border border-slate-100 bg-white p-4 active:bg-purple-50 ${
                isCreating ? "opacity-60" : ""
              }`}
            >
              <MemberAvatar member={item} />
              <View className="ml-3 flex-1">
                <Text
                  numberOfLines={1}
                  className="text-base font-bold text-slate-900"
                >
                  {item.user.name}
                </Text>
                <Text className="mt-1 text-xs text-slate-500">
                  Key Tag: {item.key_tag_id || "-"}
                </Text>
              </View>
              <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                {isCreating &&
                selectedMemberId === (item.user_id || item.user._id) ? (
                  <ActivityIndicator size="small" color="#6F3FA0" />
                ) : (
                  <Ionicons
                    name="chatbubble-outline"
                    size={19}
                    color="#6F3FA0"
                  />
                )}
              </View>
            </Pressable>
          )}
          onEndReached={() => {
            if (hasNextPage && !isFetching) void fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          refreshing={isLoading}
          onRefresh={() => void refetch()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 40,
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
                {isLoading ? (
                  <ActivityIndicator size="large" color="#6F3FA0" />
                ) : (
                  <>
                    <View className="h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                      <Ionicons
                        name={error ? "alert-circle-outline" : "people-outline"}
                        size={31}
                        color={error ? "#DC2626" : "#6F3FA0"}
                      />
                    </View>
                    <Text className="mt-4 text-center text-lg font-bold text-slate-800">
                      {error ? "Member gagal dimuat" : "Member tidak ditemukan"}
                    </Text>
                    <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
                      {error
                        ? "Tarik layar ke bawah untuk mencoba kembali."
                        : debouncedSearch
                          ? `Tidak ada hasil untuk “${debouncedSearch}”.`
                          : "Belum ada member pada club ini."}
                    </Text>
                  </>
                )}
              </View>
            )
          }
        />
      </SafeAreaView>
    </Modal>
  );
};
