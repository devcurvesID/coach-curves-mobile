import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export const useLoginUsernamePassword = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/auth/login/member", {
        username: "jonviter@gmail.com",
        password: "password",
      });
      return data;
    },
  });
};
