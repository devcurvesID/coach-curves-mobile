import { api } from "@/lib/axios";
import type { ApiResponse, PartnerPromo, Publicity } from "@/types/publicity";

export const promoService = {
  async getCommunityPartners(): Promise<ApiResponse<PartnerPromo[]>> {
    const response = await api.get("/community-partners");
    return response.data;
  },

  async getPublicities(): Promise<ApiResponse<Publicity[]>> {
    const response = await api.get("/publicities");
    return response.data;
  },
};
