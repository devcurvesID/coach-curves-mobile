import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface UserChallengeSummary {
  challenges_progress: number;
  total_workout: number;
  challenges_complete: number;
}

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
