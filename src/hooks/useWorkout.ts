import { useAuth } from "@/context/auth";
import { api } from "@/lib/axios";
import { socket } from "@/services/socket";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import type {
  WorkoutHistoryParams,
  WorkoutHistoryResponse,
} from "@/types/workout";

export const useLastWorkout = () => {
  return useQuery({
    queryKey: ["last-workout"],
    queryFn: async () => {
      const {
        data: { response },
      } = await api.get("/user/last-workout");
      return response;
    },
  });
};

export const useWorkoutHistory = () => {
  return useMutation({
    mutationFn: async ({ year, month }: WorkoutHistoryParams) => {
      const { data } = await api.get<WorkoutHistoryResponse>("/user/workout", {
        params: { year, month },
      });
      return data;
    },
  });
};

export const useWorkoutByUserId = () => {
  return useMutation({
    mutationFn: async ({ user_id, offset, limit }: any) => {
      const { data } = await api.get(
        `/workouts?user_id=${user_id}&offset=${offset}&limit=${limit}`,
      );
      return data;
    },
  });
};

export const useWorkoutHistoryByUserId = () => {
  return useMutation({
    mutationFn: async (
      params: string | { user_id: string; year?: number; month?: number },
    ) => {
      const { user_id, year, month } =
        typeof params === "string" ? { user_id: params } : params;
      const { data } = await api.get("/workouts", {
        params: {
          user_id,
          ...(year !== undefined ? { year } : {}),
          ...(month !== undefined ? { month } : {}),
        },
      });
      return data.response;
    },
  });
};

interface WorkoutTodayPage<T = unknown> {
  response: T[];
  total?: number;
  limit?: number;
  offset?: number;
}

export const useMemberWorkoutToday = <T = unknown>(
  clubId?: string,
  limit = 10,
) => {
  return useInfiniteQuery({
    queryKey: ["member-workout-today", clubId, limit],
    enabled: Boolean(clubId),
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }) => {
      const { data } = await api.get<WorkoutTodayPage<T>>("/workouts/today", {
        params: { club_id: clubId, offset: pageParam, limit },
        signal,
      });

      return {
        ...data,
        response: Array.isArray(data.response) ? data.response : [],
      };
    },
    getNextPageParam: (lastPage, pages) => {
      const loadedCount = pages.reduce(
        (total, page) => total + page.response.length,
        0,
      );

      if (lastPage.response.length === 0) return undefined;
      if (lastPage.total !== undefined) {
        return loadedCount < lastPage.total ? loadedCount : undefined;
      }

      return lastPage.response.length === limit ? loadedCount : undefined;
    },
  });
};

export const useLastWorkoutSocket = () => {
  const queryClient = useQueryClient();
  const { mutate: workoutHistoryFn } = useWorkoutHistory();
  const { user, isLoading, onReloadUserMobile } = useAuth();

  useEffect(() => {
    socket.emit("user-curves", `${user._id}_${user.source_id}`);

    const handler = async () => {
      console.log("workout-updated received:");

      queryClient.invalidateQueries({
        queryKey: ["last-workout"],
      });

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      await workoutHistoryFn({ year: currentYear, month: currentMonth });
      await onReloadUserMobile();
    };
    socket.on("workout", (data) => {
      handler();
      console.log("notiff workout => ", data);
    });
    return () => {
      socket.off("workout");
    };
  }, [queryClient]);
};

export const useNotificationTest = () => {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    socket.emit("user-curves", `${user._id}_${user.source_id}`);
    const handleNotification = async (payload: any, eventName: string) => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: {
            ...payload.data,
            type: eventName,
          },
        },
        trigger: null,
      });

      switch (eventName) {
        case "workout":
          console.log("Workout Notification");
          break;

        case "payment-bill":
          console.log("Payment Bill Notification");
          break;

        case "member-payment":
          console.log("Member Payment Notification");
          break;

        case "weigh-measure":
          console.log("Weigh Measure Notification");
          break;

        case "member-message-notes":
          console.log("Message From Coach");
          break;

        default:
          console.log(`Unknown Notification: ${eventName}`);
      }
    };

    const events = [
      "member-message-notes",
      "notification",
      "workout",
      "payment-bill",
      "member-payment",
      "weigh-measure",
    ];

    const listeners = events.map((eventName) => {
      const listener = (payload: any) => handleNotification(payload, eventName);

      socket.on(eventName, listener);

      return { eventName, listener };
    });

    return () => {
      listeners.forEach(({ eventName, listener }) => {
        socket.off(eventName, listener);
      });
    };
  }, [user]);
};
