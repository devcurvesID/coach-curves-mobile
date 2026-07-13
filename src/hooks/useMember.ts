import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

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
