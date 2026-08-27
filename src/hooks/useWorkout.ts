import { useAuth } from "@/context/auth";
import { api } from "@/lib/axios";
import { socket } from "@/services/socket";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

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
    mutationFn: async ({ year, month }: { year: number; month: number }) => {
      const { data } = await api.get("/user/workout", {
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

export const useMemberWorkoutToday = () => {
  return useMutation({
    mutationFn: async (coach_id: string) => {
      const { data } = await api.get(`/coach-member/member-wo/${coach_id}`);
      return data;
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
