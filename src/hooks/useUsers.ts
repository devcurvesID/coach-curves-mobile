import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async (body: any) => {
      const {
        data: { response },
      } = await api.patch(`/user`, body);
      return response;
    },
  });
};
