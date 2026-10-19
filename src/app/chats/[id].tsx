import { useAuth } from "@/context/auth";
import {
  useChatMessages,
  useSendChatMessage,
  type ChatMessageItem,
} from "@/hooks/useChats";
import { imageProfileURL } from "@/services/image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface RoomMessage {
  id: string;
  text: string;
  createdAt: Date;
  isMine: boolean;
}

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("") || "M";

const getResponseRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const getResponseId = (value: unknown): string | undefined => {
  const record = getResponseRecord(value);
  const id = record?._id ?? record?.id ?? record?.message_id;
  if (typeof id === "string" || typeof id === "number") return String(id);
  return undefined;
};

const MessageBubble = ({ message }: { message: RoomMessage }) => (
  <View
    className={`mb-3 max-w-[82%] ${
      message.isMine ? "self-end items-end" : "self-start items-start"
    }`}
  >
    <View
      className={`rounded-2xl px-4 py-3 ${
        message.isMine
          ? "rounded-br-sm bg-purple-700"
          : "rounded-bl-sm border border-slate-100 bg-white"
      }`}
    >
      <Text
        className={`text-[15px] leading-5 ${
          message.isMine ? "text-white" : "text-slate-800"
        }`}
      >
        {message.text}
      </Text>
    </View>
    <Text className="mt-1 px-1 text-[10px] text-slate-400">
      {new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(message.createdAt)}
    </Text>
  </View>
);

export default function ChatRoomScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id, name, photo } = useLocalSearchParams<{
    id: string;
    name?: string;
    photo?: string;
  }>();
  const [messageText, setMessageText] = useState("");
  const [isQuickMessageVisible, setIsQuickMessageVisible] = useState(false);
  const [sentMessages, setSentMessages] = useState<RoomMessage[]>([]);
  const [sendError, setSendError] = useState<string | null>(null);
  const [hasPhotoError, setHasPhotoError] = useState(false);
  const messageListRef = useRef<FlatList<RoomMessage>>(null);
  const { mutateAsync: sendMessage, isPending } = useSendChatMessage();
  const {
    data: messageHistory = [],
    isLoading: isLoadingMessages,
    isFetching: isFetchingMessages,
    isError: isMessageHistoryError,
    refetch: refetchMessages,
  } = useChatMessages(id);
  const memberName = name?.trim() || "Member";
  const currentUserId = user?._id ? String(user._id) : undefined;
  const messages = React.useMemo(() => {
    const historyMessages = messageHistory.map(
      (message: ChatMessageItem): RoomMessage => {
        const date = message.createdAt
          ? new Date(message.createdAt.replace(" ", "T"))
          : new Date();
        return {
          id: message.id,
          text: message.text,
          createdAt: Number.isNaN(date.getTime()) ? new Date() : date,
          isMine: Boolean(
            currentUserId &&
            message.senderId &&
            currentUserId === message.senderId,
          ),
        };
      },
    );
    const historyIds = new Set(historyMessages.map((message) => message.id));

    return [
      ...historyMessages,
      ...sentMessages.filter((message) => !historyIds.has(message.id)),
    ]
      .filter(
        (message, index, allMessages) =>
          allMessages.findIndex((item) => item.id === message.id) === index,
      )
      .sort(
        (first, second) =>
          first.createdAt.getTime() - second.createdAt.getTime(),
      );
  }, [currentUserId, messageHistory, sentMessages]);

  const submitMessage = async () => {
    const text = messageText.trim();
    if (!id || !text || isPending) return;

    try {
      setSendError(null);
      const response = await sendMessage({ chatId: id, text });
      const newMessage: RoomMessage = {
        id:
          getResponseId(response) ??
          `${user?._id ?? "user"}-${Date.now().toString()}`,
        text,
        createdAt: new Date(),
        isMine: true,
      };
      setSentMessages((current) => [...current, newMessage]);
      setMessageText("");
      requestAnimationFrame(() =>
        messageListRef.current?.scrollToEnd({ animated: true }),
      );
    } catch (error) {
      setSendError(
        error instanceof Error
          ? error.message
          : "Pesan belum berhasil dikirim. Silakan coba kembali.",
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-row items-center border-b border-slate-100 bg-white px-4 py-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali ke daftar chat"
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <Ionicons name="arrow-back" size={23} color="#334155" />
          </Pressable>

          {photo && !hasPhotoError ? (
            <Image
              source={{
                uri: /^https?:\/\//i.test(photo)
                  ? photo
                  : imageProfileURL(memberName, photo),
              }}
              onError={() => setHasPhotoError(true)}
              className="ml-2 h-11 w-11 rounded-full bg-purple-100"
            />
          ) : (
            <View className="ml-2 h-11 w-11 items-center justify-center rounded-full bg-purple-100">
              <Text className="font-black text-purple-700">
                {getInitials(memberName)}
              </Text>
            </View>
          )}

          <View className="ml-3 flex-1">
            <Text
              className="text-base font-black text-slate-900"
              numberOfLines={1}
            >
              {memberName}
            </Text>
            <Text className="mt-0.5 text-xs text-emerald-600">
              Room chat member
            </Text>
          </View>
        </View>

        <FlatList
          ref={messageListRef}
          data={messages}
          keyExtractor={(message) => message.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetchingMessages && !isLoadingMessages}
              onRefresh={() => void refetchMessages()}
              colors={["#6F3FA0"]}
              tintColor="#6F3FA0"
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 20,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            isLoadingMessages ? (
              <View className="flex-1 items-center justify-center pb-16">
                <ActivityIndicator size="large" color="#6F3FA0" />
                <Text className="mt-3 text-sm text-slate-500">
                  Memuat riwayat pesan...
                </Text>
              </View>
            ) : isMessageHistoryError ? (
              <View className="flex-1 items-center justify-center px-8 pb-16">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-red-50">
                  <Ionicons
                    name="alert-circle-outline"
                    size={31}
                    color="#DC2626"
                  />
                </View>
                <Text className="mt-4 text-center text-lg font-bold text-slate-800">
                  Riwayat pesan gagal dimuat
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void refetchMessages()}
                  className="mt-4 rounded-xl bg-purple-700 px-5 py-3"
                >
                  <Text className="font-bold text-white">Coba Lagi</Text>
                </Pressable>
              </View>
            ) : (
              <View className="flex-1 items-center justify-center px-8 pb-16">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-purple-100">
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={38}
                    color="#7C3AED"
                  />
                </View>
                <Text className="mt-5 text-center text-xl font-black text-slate-800">
                  Belum ada pesan
                </Text>
                <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                  Mulai percakapan dengan {memberName} melalui kolom pesan di
                  bawah.
                </Text>
              </View>
            )
          }
        />

        <View className="border-t border-slate-100 bg-white px-4 pb-2 pt-3">
          {sendError ? (
            <View className="mb-2 flex-row items-start rounded-xl bg-red-50 px-3 py-2.5">
              <Ionicons name="alert-circle-outline" size={17} color="#DC2626" />
              <Text className="ml-2 flex-1 text-xs leading-5 text-red-600">
                {sendError}
              </Text>
            </View>
          ) : null}
          <View className="flex-row items-end rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Buka pesan cepat"
              disabled={isPending}
              onPress={() => setIsQuickMessageVisible(true)}
              className="mr-2 h-11 w-11 items-center justify-center rounded-full bg-purple-100"
            >
              <Ionicons name="flash-outline" size={20} color="#6F3FA0" />
            </Pressable>
            <TextInput
              value={messageText}
              onChangeText={(value) => {
                setMessageText(value);
                if (sendError) setSendError(null);
              }}
              editable={!isPending}
              multiline
              maxLength={1000}
              placeholder="Tulis pesan..."
              placeholderTextColor="#94A3B8"
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={() => void submitMessage()}
              className="max-h-28 min-h-10 flex-1 py-2 text-[15px] text-slate-800"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kirim pesan"
              accessibilityState={{
                disabled: !messageText.trim() || isPending,
              }}
              disabled={!messageText.trim() || isPending}
              onPress={() => void submitMessage()}
              className={`ml-2 h-11 w-11 items-center justify-center rounded-full ${
                messageText.trim() && !isPending
                  ? "bg-purple-700"
                  : "bg-slate-300"
              }`}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={19} color="#FFFFFF" />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <QuickMessageModal
        visible={isQuickMessageVisible}
        onCancel={() => setIsQuickMessageVisible(false)}
        onSelect={(message) => {
          setMessageText(message);
          setSendError(null);
          setIsQuickMessageVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
import { QuickMessageModal } from "@/components/chat/quick-message-modal";
