import { api } from "@/lib/axios";
import type { Club, ClubCoach } from "@/types/club";
import { useQuery } from "@tanstack/react-query";

export interface ClubDashboardTotals {
  totalMembers: number;
  workoutToday: number;
  weighMeasureToday: number;
  memberBills: number;
}

interface ClubDashboardResponse {
  response?: {
    total_wo_today?: number;
    total_wm_today?: number;
    total_member?: number;
    total_member_payment?: number;
  };
}

export const useClubDashboard = (clubId?: string) => {
  return useQuery<ClubDashboardTotals>({
    queryKey: ["club-dashboard", clubId],
    enabled: Boolean(clubId),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ClubDashboardResponse>(
        `/clubs/dashboard/${encodeURIComponent(clubId!)}`,
        { signal },
      );
      const dashboard = data.response;

      return {
        totalMembers: dashboard?.total_member ?? 0,
        workoutToday: dashboard?.total_wo_today ?? 0,
        weighMeasureToday: dashboard?.total_wm_today ?? 0,
        memberBills: dashboard?.total_member_payment ?? 0,
      };
    },
  });
};

export const useUserClub = () => {
  return useQuery({
    queryKey: ["club"],
    queryFn: async () => {
      const {
        data: { response },
      } = await api.get("/user/club");
      return response;
    },
  });
};

export const useClubs = () => {
  return useQuery<Club[]>({
    queryKey: ["clubs"],
    queryFn: async () => {
      const {
        data: { response },
      } = await api.get("/clubs");
      return response;
    },
  });
};

interface CoachesResponse {
  response?: ClubCoach[] | null;
}

export const useCoachesByClubId = (clubId?: string) => {
  return useQuery<ClubCoach[]>({
    queryKey: ["coaches", "club", clubId],
    enabled: Boolean(clubId),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<CoachesResponse>("/coachs", {
        params: { club_id: clubId },
        signal,
      });

      return Array.isArray(data.response) ? data.response : [];
    },
  });
};
