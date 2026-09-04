import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export interface UpdateAccountPayload {
  password: string;
  verify_password: string;
  username: string;
}

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

export const useUpdateAccount = () =>
  useMutation({
    mutationFn: async (body: UpdateAccountPayload) => {
      const {
        data: { response },
      } = await api.patch("/auth/update-account", body);
      return response;
    },
  });
