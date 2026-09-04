import { api } from "@/lib/axios";
import type { Club, ClubCoach } from "@/types/club";
import { useQuery } from "@tanstack/react-query";

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
