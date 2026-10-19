import { CreateChatMemberModal } from "@/components/chat/create-chat-member-modal";
import ContainerPage from "@/components/ui/container-page";
import {
  useChatList,
  useCreateChat,
  type ChatListItem,
} from "@/hooks/useChats";
import type { Member } from "@/hooks/useMember";
import { imageProfileURL } from "@/services/image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("") || "C";

const formatChatTime = (value?: string | null): string => {
  if (!value) return "";
  const normalizedValue = value.includes(" ") ? value.replace(" ", "T") : value;
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  const startToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const differenceInDays = Math.round(
    (startToday.getTime() - startDate.getTime()) / 86_400_000,
  );

  if (differenceInDays === 0) {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
  if (differenceInDays === 1) return "Kemarin";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
  }).format(date);
};

const ChatAvatar = ({ chat }: { chat: ChatListItem }) => {
  const [hasImageError, setHasImageError] = useState(false);

  if (chat.photo && !hasImageError) {
    return (
      <Image
        source={{
          uri: /^https?:\/\//i.test(chat.photo)
            ? chat.photo
            : imageProfileURL(chat.name, chat.photo),
        }}
        onError={() => setHasImageError(true)}
        className="h-14 w-14 rounded-full bg-purple-100"
      />
    );
  }

  return (
    <View className="h-14 w-14 items-center justify-center rounded-full bg-purple-100">
      <Text className="text-base font-black text-purple-700">
        {getInitials(chat.name)}
      </Text>
    </View>
  );
};

const ChatCard = ({
  chat,
  onPress,
}: {
  chat: ChatListItem;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={`Buka chat dengan ${chat.name}`}
    onPress={onPress}
    className="mx-5 mb-3 flex-row items-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm active:bg-purple-50"
  >
    <View className="relative">
      <ChatAvatar chat={chat} />
      <View
        accessibilityLabel={chat.isOnline ? "Online" : "Offline"}
        className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
          chat.isOnline ? "bg-emerald-500" : "bg-slate-300"
        }`}
      />
      {chat.unreadCount > 0 ? (
        <View className="absolute -right-1 -top-1 min-w-5 items-center justify-center rounded-full border-2 border-white bg-purple-700 px-1">
          <Text className="text-[10px] font-bold text-white">
            {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
          </Text>
        </View>
      ) : null}
    </View>

    <View className="ml-3 flex-1">
      <View className="flex-row items-start justify-between">
        <Text
          className="mr-2 flex-1 text-base font-bold text-slate-900"
          numberOfLines={1}
        >
          {chat.name}
        </Text>
        <Text className="text-[11px] text-slate-400">
          {formatChatTime(chat.updatedAt)}
        </Text>
      </View>
      <Text
        className={`mt-0.5 text-[11px] ${
          chat.isOnline ? "font-semibold text-emerald-600" : "text-slate-400"
        }`}
        numberOfLines={1}
      >
        {chat.isOnline ? "Online" : chat.email || "Offline"}
      </Text>
      <Text
        className={`mt-1 text-sm ${
          chat.unreadCount > 0
            ? "font-semibold text-slate-700"
            : "text-slate-500"
        }`}
        numberOfLines={2}
      >
        {chat.lastMessage}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
  </Pressable>
);

export default function ChatListScreen() {
  const router = useRouter();
  const [isCreateChatVisible, setIsCreateChatVisible] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const { mutateAsync: createChat, isPending: isCreatingChat } =
    useCreateChat();
  const {
    data: chats = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useChatList();
  console.log("chatschats", chats);

  const selectMember = async (member: Member) => {
    if (isCreatingChat) return;

    const participantId = member.user_id || member.user._id;
    if (!participantId) {
      Alert.alert(
        "Chat belum dapat dibuat",
        "ID pengguna member tidak ditemukan.",
      );
      return;
    }

    try {
      setSelectedMemberId(participantId);
      await createChat({ participant_id: participantId });
      setIsCreateChatVisible(false);
      Alert.alert(
        "Chat berhasil dibuat",
        `Percakapan dengan ${member.user.name} sudah tersedia.`,
      );
    } catch (error) {
      Alert.alert(
        "Chat gagal dibuat",
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat percakapan.",
      );
    } finally {
      setSelectedMemberId(null);
    }
  };

  return (
    <>
      <ContainerPage titleHeader="Chat" titleContent="Daftar percakapan">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6F3FA0" />
            <Text className="mt-3 text-sm text-slate-500">
              Memuat daftar chat...
            </Text>
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center px-8">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
            </View>
            <Text className="mt-4 text-center text-lg font-bold text-slate-800">
              Daftar chat gagal dimuat
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
              Periksa koneksi Anda, lalu coba kembali.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void refetch()}
              className="mt-5 rounded-xl bg-purple-700 px-5 py-3"
            >
              <Text className="font-bold text-white">Coba Lagi</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(chat) => chat.id}
            renderItem={({ item }) => (
              <ChatCard
                chat={item}
                onPress={() =>
                  router.push({
                    pathname: "/chats/[id]",
                    params: {
                      id: item.id,
                      name: item.name,
                      ...(item.photo ? { photo: item.photo } : {}),
                    },
                  })
                }
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 20,
              paddingBottom: 120,
              flexGrow: 1,
            }}
            refreshControl={
              <RefreshControl
                refreshing={isFetching}
                onRefresh={() => void refetch()}
                colors={["#6F3FA0"]}
                tintColor="#6F3FA0"
              />
            }
            ListHeaderComponent={
              chats.length > 0 ? (
                <View className="mx-5 mb-4 flex-row items-center rounded-2xl bg-purple-50 px-4 py-3">
                  <Ionicons
                    name="chatbubbles-outline"
                    size={21}
                    color="#6F3FA0"
                  />
                  <Text className="ml-2 flex-1 text-sm font-semibold text-purple-800">
                    {chats.length} percakapan tersedia
                  </Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center px-8 pb-24">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-purple-100">
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={38}
                    color="#8B5CF6"
                  />
                </View>
                <Text className="mt-5 text-center text-xl font-black text-slate-800">
                  Belum ada chat
                </Text>
                <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                  Percakapan baru akan muncul di sini ketika chat tersedia.
                </Text>
              </View>
            }
          />
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Buat chat baru"
          onPress={() => setIsCreateChatVisible(true)}
          className="absolute bottom-6 right-5 flex-row items-center rounded-full bg-purple-700 px-5 py-4 shadow-lg active:bg-purple-800"
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text className="ml-2 font-bold text-white">Buat Chat</Text>
        </Pressable>
      </ContainerPage>

      <CreateChatMemberModal
        visible={isCreateChatVisible}
        isCreating={isCreatingChat}
        selectedMemberId={selectedMemberId}
        onCancel={() => {
          if (!isCreatingChat) setIsCreateChatVisible(false);
        }}
        onSelectMember={selectMember}
      />
    </>
  );
}
