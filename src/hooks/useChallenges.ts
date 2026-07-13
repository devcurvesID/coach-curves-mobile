import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useChallenges = () => {
  return useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const {
        data: { response },
      } = await api.get("/challenges");
      return response;
    },
  });
};
