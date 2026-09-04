import { api } from "@/lib/axios";
import type { MemberRank } from "@/types/rank";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export const MEMBER_RANK_PAGE_SIZE = 10;

export interface CreateMemberRankPayload {
  weigh_diff: string | number;
  size_diff: string | number;
  body_fat_diff: string | number;
  wo_count: number;
  wm_date: string;
}

export const useCreateMemberRank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMemberRankPayload) => {
      const { data } = await api.post("/rank-history", payload);
      return data.response ?? data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["member-rank-history"] }),
  });
};

export type MemberRankScope = "club" | "monthly";

interface MemberRankResponse {
  response: MemberRank[] | null;
}

export const useMemberRankHistory = (
  clubId?: string,
  scope: MemberRankScope = "club",
) =>
  useInfiniteQuery({
    queryKey: ["member-rank-history", clubId, scope],
    enabled: Boolean(clubId),
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }) => {
      const endpoint =
        scope === "monthly"
          ? `/rank-history/monthly/${encodeURIComponent(clubId ?? "")}`
          : "/rank-history";
      const { data } = await api.get<MemberRankResponse>(endpoint, {
        params: {
          ...(scope === "club" ? { club_id: clubId } : {}),
          offset: pageParam,
          limit: MEMBER_RANK_PAGE_SIZE,
        },
        signal,
      });

      return Array.isArray(data.response) ? data.response : [];
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < MEMBER_RANK_PAGE_SIZE) return undefined;

      const loadedIds = new Set(
        pages.slice(0, -1).flatMap((page) => page.map((member) => member._id)),
      );
      const containsNewMember = lastPage.some(
        (member) => !loadedIds.has(member._id),
      );

      return containsNewMember
        ? pages.length * MEMBER_RANK_PAGE_SIZE
        : undefined;
    },
  });
