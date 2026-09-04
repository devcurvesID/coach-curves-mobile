import { api } from "@/lib/axios";
import { promoService } from "@/services/promoService";
import type { Publicity } from "@/types/publicity";
import { useQuery } from "@tanstack/react-query";

export const usePublicities = () => {
  return useQuery<Publicity[]>({
    queryKey: ["publicities"],
    queryFn: async () => {
      const {
        data: { response },
      } = await api.get("/publicities");
      return response;
    },
  });
};

export const useCommunityPartners = () => {
  return useQuery({
    queryKey: ["community-partners"],
    queryFn: async () => {
      const { response } = await promoService.getCommunityPartners();
      return response;
    },
  });
};
