import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const usePublicities = () => {
  return useQuery({
    queryKey: ["publicities"],
    queryFn: async () => {
      const {
        data: { response },
      } = await api.get("/publicities");
      return response;
    },
  });
};
