import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface UserChallengeSummary {
  challenges_progress: number;
  total_workout: number;
  challenges_complete: number;
}

export interface CompletedUserChallenge {
  _id: string;
  status: string;
  notes?: string | null;
  is_claimed?: boolean;
  updated_at: string;
  challenge: {
    _id: string;
    challenge: string;
    variable_target: number;
  };
}

export const useCompletedUserChallenges = (userId?: string) =>
  useQuery<CompletedUserChallenge[]>({
    queryKey: ["user-challenge", "completed", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data } = await api.get("/user-challenge", {
        params: { user_id: userId },
      });
      const response = data.response ?? [];
      if (!Array.isArray(response)) {
        throw new Error("Format challenge selesai tidak sesuai.");
      }
      return response.filter(
        (item: CompletedUserChallenge) =>
          item.status?.toUpperCase() === "COMPLETED",
      );
    },
  });

export const useChallenges = (userId?: string) => {
  return useQuery({
    queryKey: ["challenges", userId],
    queryFn: async () => {
      const {
        data: { response },
      } = await api.get(
        userId
          ? `/challenges?user_id=${encodeURIComponent(userId)}`
          : "/challenges",
      );
      return response;
    },
  });
};

export const useChallengeSummaryByUserId = (userId?: string) => {
  return useQuery<UserChallengeSummary>({
    queryKey: ["user-challenge", "summary", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data } = await api.get(
        `/user-challenge/check-challenge?user_id=${encodeURIComponent(
          userId ?? "",
        )}`,
      );
      return data.response;
    },
  });
};
