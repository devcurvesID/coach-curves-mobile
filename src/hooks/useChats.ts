import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface ChatListItem {
  id: string;
  name: string;
  email?: string | null;
  photo?: string | null;
  isOnline: boolean;
  lastMessage: string;
  updatedAt?: string | null;
  unreadCount: number;
}

export interface ChatMessageItem {
  id: string;
  text: string;
  senderId?: string;
  createdAt?: string | null;
}

type UnknownRecord = Record<string, unknown>;

interface ChatListApiResponse {
  response?: unknown;
}

const isRecord = (value: unknown): value is UnknownRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getString = (...values: unknown[]): string | undefined => {
  const value = values.find(
    (item) => typeof item === "string" && item.trim().length > 0,
  );
  return typeof value === "string" ? value.trim() : undefined;
};

const getIdentifier = (...values: unknown[]): string | undefined => {
  const value = values.find(
    (item) =>
      (typeof item === "string" && item.trim().length > 0) ||
      (typeof item === "number" && Number.isFinite(item)),
  );
  if (typeof value === "number") return String(value);
  return typeof value === "string" ? value.trim() : undefined;
};

const getNestedRecord = (
  record: UnknownRecord,
  ...keys: string[]
): UnknownRecord | undefined => {
  for (const key of keys) {
    if (isRecord(record[key])) return record[key];
  }
  return undefined;
};

const getLastMessage = (record: UnknownRecord): string => {
  const lastMessage = record.last_message ?? record.lastMessage;
  if (isRecord(lastMessage)) {
    return (
      getString(
        lastMessage.message,
        lastMessage.content,
        lastMessage.text,
        lastMessage.body,
      ) ?? "Belum ada pesan"
    );
  }

  return (
    getString(lastMessage, record.message, record.content, record.text) ??
    "Belum ada pesan"
  );
};

const normalizeChat = (record: UnknownRecord, index: number): ChatListItem => {
  const participant = getNestedRecord(
    record,
    "user",
    "member",
    "participant",
    "receiver",
    "sender",
    "contact",
  );
  const id =
    getIdentifier(record._id, record.id, record.chat_id, record.room_id) ??
    `chat-${index}`;
  const unreadValue =
    record.unread_count ?? record.unreadCount ?? record.total_unread ?? 0;
  const unreadCount = Number(unreadValue);

  return {
    id,
    name:
      getString(
        participant?.name,
        participant?.full_name,
        record.name,
        record.title,
      ) ?? "Percakapan",
    email: getString(participant?.email) ?? null,
    photo:
      getString(
        participant?.photo,
        participant?.avatar,
        record.photo,
        record.avatar,
      ) ?? null,
    isOnline: participant?.is_online === true,
    lastMessage: getLastMessage(record),
    updatedAt:
      getString(record.updated_at, record.last_message_at, record.created_at) ??
      null,
    unreadCount:
      Number.isFinite(unreadCount) && unreadCount > 0
        ? Math.floor(unreadCount)
        : 0,
  };
};

const getChatRecords = (response: unknown): UnknownRecord[] => {
  if (Array.isArray(response)) return response.filter(isRecord);
  if (!isRecord(response)) return [];

  const nestedList =
    response.data ?? response.items ?? response.chats ?? response.results;
  if (Array.isArray(nestedList)) return nestedList.filter(isRecord);
  return [];
};

const getMessageRecords = (response: unknown): UnknownRecord[] => {
  if (Array.isArray(response)) return response.filter(isRecord);
  if (!isRecord(response)) return [];

  const nestedList =
    response.data ?? response.items ?? response.messages ?? response.results;
  if (Array.isArray(nestedList)) return nestedList.filter(isRecord);
  return [];
};

const normalizeMessage = (
  record: UnknownRecord,
  index: number,
): ChatMessageItem => {
  const sender = getNestedRecord(record, "sender", "user");

  return {
    id:
      getIdentifier(record._id, record.id, record.message_id) ??
      `message-${index}`,
    text:
      getString(record.text, record.message, record.content, record.body) ?? "",
    senderId: getIdentifier(
      record.sender_id,
      record.user_id,
      sender?._id,
      sender?.id,
    ),
    createdAt:
      getString(record.created_at, record.sent_at, record.updated_at) ?? null,
  };
};

export const useChatList = () =>
  useQuery<ChatListItem[]>({
    queryKey: ["chats", "list"],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ChatListApiResponse | UnknownRecord[]>(
        "/chats/list",
        { signal },
      );
      const response = Array.isArray(data) ? data : data.response;

      return getChatRecords(response).map(normalizeChat);
    },
  });

export const useChatMessages = (chatId?: string) =>
  useQuery<ChatMessageItem[]>({
    queryKey: ["messages", "list", chatId],
    enabled: Boolean(chatId),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ChatListApiResponse>(
        `/messages/list/${encodeURIComponent(chatId!)}`,
        { signal },
      );

      return getMessageRecords(data.response).map(normalizeMessage);
    },
  });

interface CreateChatPayload {
  participant_id: string;
}

export const useCreateChat = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, CreateChatPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/chats/create", payload);
      return data.response ?? data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["chats", "list"] });
    },
  });
};

interface SendChatMessagePayload {
  chatId: string;
  text: string;
}

export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, SendChatMessagePayload>({
    mutationFn: async ({ chatId, text }) => {
      const { data } = await api.post(
        `/messages/send-message/${encodeURIComponent(chatId)}`,
        { text },
      );
      return data.response ?? data;
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["messages", "list", variables.chatId],
        }),
        queryClient.invalidateQueries({ queryKey: ["chats", "list"] }),
      ]);
    },
  });
};
