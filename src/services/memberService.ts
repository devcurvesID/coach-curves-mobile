import { api } from "@/lib/axios";
import type { MemberHold } from "@/types/member";

export interface MemberRankQueryParams {
  club_id?: string | number;
  user_id?: string | number;
  year?: number;
  month?: number;
  offset?: number;
  limit?: number;
}

export interface CreateMemberRankPayload {
  weigh_diff: string | number;
  size_diff: string | number;
  body_fat_diff: string | number;
  wo_count: number;
  wm_date: string;
}

export interface ChallengeUserInformation {
  challenges_progress: number;
  total_workout: number;
  challenges_complete: number;
}

export const memberService = {
  async getMemberChallenges(): Promise<any> {
    const response = await api.get("/challenges");
    return response.data;
  },

  async getMemberChallengesComplete(user_id: string): Promise<any> {
    const response = await api.get(`/user-challenge?user_id=${user_id}`);
    return response.data;
  },
  async getInformationChallengesUser(
    user_id: string,
  ): Promise<ChallengeUserInformation> {
    const response = await api.get(
      `/user-challenge/check-challenge?user_id=${user_id}`,
    );
    return response.data.response;
  },

  async getMemberWorkoutHistory<T = unknown>(query?: string): Promise<T> {
    // ?year=${year}&month=${month}
    let q_data = "/user/workout";
    if (query) {
      q_data = `/user/workout${query}`;
    }
    const response = await api.get(q_data);
    return response.data;
  },

  async getMemberRankWM<T = unknown>(
    query?: string | MemberRankQueryParams,
  ): Promise<{ response: T }> {
    if (typeof query === "string") {
      const response = await api.get(`/rank-history${query}`);
      return response.data;
    }

    const response = await api.get("/rank-history", { params: query });
    return response.data;
  },

  async getMonthlyMemberRank<T = unknown>(
    clubId: string | number,
    query?: Pick<MemberRankQueryParams, "offset" | "limit">,
  ): Promise<{ response: T }> {
    const response = await api.get(`/rank-history/monthly/${clubId}`, {
      params: query,
    });
    return response.data;
  },

  async createMemberRank<T = unknown>(
    payload: CreateMemberRankPayload,
  ): Promise<T> {
    const response = await api.post("/rank-history", payload);
    return response.data;
  },

  async getMemberHold(
    userSourceId: string | number,
  ): Promise<MemberHold | null> {
    const {
      data: { response },
    } = await api.get("/member-hold", {
      params: { user_source_id: userSourceId },
    });

    return response;
  },
};
