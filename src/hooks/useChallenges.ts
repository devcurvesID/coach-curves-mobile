import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export interface UserChallengeSummary {
  challenges_progress: number;
  total_workout: number;
  challenges_complete: number;
}

export interface CurrentUserChallenge {
  _id: string;
  source_id?: number | null;
  challenge: string;
  type: string;
  variable: number;
  sequencable?: string | null;
  sequence?: number | null;
  variable_target: number;
  status: string;
  picture?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface CurrentUserChallengeResponse {
  response?: CurrentUserChallenge | null;
}

export const useCurrentUserChallenge = (userId?: string) =>
  useQuery<CurrentUserChallenge | null>({
    queryKey: ["user-challenge", "current", userId],
    enabled: Boolean(userId),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<CurrentUserChallengeResponse>(
        `/user-challenge/current-challenge/${encodeURIComponent(userId!)}`,
        { signal },
      );

      return data.response ?? null;
    },
  });

interface CheckCurrentChallengePayload {
  user_id: string;
  challenge_id: string;
}

export const useCheckCurrentChallengeCompletion = (
  userId?: string,
  challengeId?: string,
) => {
  const queryClient = useQueryClient();
  const checkedChallengeRef = useRef<string | null>(null);
  const checkChallenge = useMutation({
    mutationFn: async (payload: CheckCurrentChallengePayload) => {
      const { data } = await api.post(
        "/user-challenge/check-challenge",
        payload,
      );
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["user-challenge", "current", userId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["user-challenge", "summary", userId],
      });
    },
  });
  const { mutate: runChallengeCheck } = checkChallenge;

  useEffect(() => {
    if (!userId || !challengeId) return;

    const challengeKey = `${userId}:${challengeId}`;
    if (checkedChallengeRef.current === challengeKey) return;

    checkedChallengeRef.current = challengeKey;
    runChallengeCheck({
      user_id: userId,
      challenge_id: challengeId,
    });
  }, [challengeId, runChallengeCheck, userId]);

  return checkChallenge;
};

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
