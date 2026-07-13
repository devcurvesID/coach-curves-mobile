import { api } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useProvinces = () => {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      const {
        data: { response },
      } = await api.get("/regions/provinces");
      return response;
    },
  });
};

export const useRegencies = () => {
  return useMutation({
    mutationFn: async (province_id) => {
      const {
        data: { response },
      } = await api.get(`/regions/regencies/${province_id}`);
      return response;
    },
  });
};

export const useDistricts = () => {
  return useMutation({
    mutationFn: async (regency_id) => {
      const {
        data: { response },
      } = await api.get(`/regions/districts/${regency_id}`);
      return response;
    },
  });
};

export const useVillages = () => {
  return useMutation({
    mutationFn: async (district_id) => {
      const {
        data: { response },
      } = await api.get(`/regions/villages/${district_id}`);
      return response;
    },
  });
};
