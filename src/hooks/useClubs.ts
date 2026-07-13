import { api } from "@/lib/axios";
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
  return useQuery({
    queryKey: ["clubs"],
    queryFn: async () => {
      const {
        data: { response },
      } = await api.get("/clubs");
      return response;
    },
  });
};
