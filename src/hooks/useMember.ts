import { useAuth } from "@/context/auth";
import { api } from "@/lib/axios";
import { useWorkoutHistory } from "@/hooks/useWorkout";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export interface MemberUser {
  _id?: string;
  name: string;
  email?: string | null;
}

export interface Member {
  _id: string;
  user_id: string;
  user: MemberUser;
  photo?: string | null;
  phone?: string | number | null;
  address?: string | null;
  joined?: string | null;
  flag?: string | null;
  sex?: "F" | "M" | string | null;
  key_tag_id?: string | null;
}

interface MembersPage {
  members: Member[];
  total?: number;
  limit?: number;
  offset?: number;
}

interface MembersApiResponse {
  total?: number;
  limit?: number;
  offset?: number;
  response:
    | Member[]
    | {
        data?: Member[];
        members?: Member[];
        results?: Member[];
        total?: number;
      };
}

interface UseListMemberParams {
  clubId?: string;
  name?: string;
  limit?: number;
}

export const useMemberTotal = (clubId?: string) => {
  return useQuery({
    queryKey: ["members", "total", clubId],
    enabled: Boolean(clubId),
    queryFn: async () => {
      const { data } = await api.get<MembersApiResponse>(
        `/members?club_id=${encodeURIComponent(clubId ?? "")}`,
      );
      const page = normalizeMembersResponse(data.response, data.total);

      return page.total ?? page.members.length;
    },
  });
};

const normalizeMembersResponse = (
  response: MembersApiResponse["response"],
  rootTotal?: number,
  offset?: number,
  limit?: number,
): MembersPage => {
  if (Array.isArray(response)) {
    return { members: response, total: rootTotal, offset, limit };
  }
  return {
    members: response.data ?? response.members ?? response.results ?? [],
    total: rootTotal ?? response.total,
    offset,
    limit,
  };
};

export const useMemberStatus = () => {
  return useQuery({
    queryKey: ["member-status"],
    queryFn: async () => {
      const {
        data: { response },
      } = await api.get("/user/member-status");
      return response;
    },
  });
};

export const useMemberCardData = () => {
  const { user, isLoading: isLoadingUser } = useAuth();
  const memberStatusQuery = useMemberStatus();
  const workoutHistoryQuery = useWorkoutHistory();

  useEffect(() => {
    const today = new Date();
    workoutHistoryQuery.mutate({
      year: today.getFullYear(),
      month: today.getMonth(),
    });
  }, []);

  const workoutHistory = workoutHistoryQuery.data;

  return {
    user,
    userPersonal: user?.user_personal,
    memberStatus: memberStatusQuery.data,
    displayStatus: memberStatusQuery.data?.status ?? "Member",
    currentMonthWorkoutCount: workoutHistory?.total_workout_per_month ?? 0,
    totalWorkoutCount: workoutHistory?.total ?? 0,
    isLoading:
      isLoadingUser ||
      memberStatusQuery.isLoading ||
      workoutHistoryQuery.isPending,
  };
};

export const useInfiniteMembers = ({
  clubId,
  name = "",
  limit = 10,
}: UseListMemberParams) => {
  return useInfiniteQuery({
    queryKey: ["members", clubId, name, limit],
    enabled: Boolean(clubId),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<MembersApiResponse>("/members", {
        params: {
          club_id: clubId,
          ...(name ? { name } : {}),
          offset: pageParam,
          limit,
        },
      });
      return normalizeMembersResponse(
        data.response,
        data.total,
        data.offset ?? pageParam,
        data.limit ?? limit,
      );
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.members.length === 0) return undefined;

      const previousMemberIds = new Set(
        pages
          .slice(0, -1)
          .flatMap((page) => page.members)
          .map((member) => member._id || member.user_id),
      );
      const containsNewMember = lastPage.members.some(
        (member) => !previousMemberIds.has(member._id || member.user_id),
      );
      if (!containsNewMember) return undefined;

      const loadedCount = pages.reduce(
        (total, page) => total + page.members.length,
        0,
      );
      const nextOffset =
        (lastPage.offset ?? loadedCount - lastPage.members.length) +
        lastPage.members.length;
      if (lastPage.total !== undefined) {
        return nextOffset < lastPage.total ? nextOffset : undefined;
      }
      return lastPage.members.length === limit ? nextOffset : undefined;
    },
  });
};

export const useListMember = () => {
  return useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const {
        data: { response },
      } = await api.get("/user/members");
      return response;
    },
  });
};

export const useDetailMemberByUserId = () => {
  return useMutation({
    mutationFn: async (user_id: string) => {
      const { data } = await api.get(`/member/${user_id}`);
      return data.response;
    },
  });
};

export const useListMemberOfCoach = () => {
  return useMutation({
    mutationFn: async (coach_id: string) => {
      const { data } = await api.get(`/coach-member/list-member/${coach_id}`);
      return data;
    },
  });
};
