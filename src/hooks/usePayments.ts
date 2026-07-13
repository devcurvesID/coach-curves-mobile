import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useMemberPayment = () => {
  return useQuery({
    queryKey: ["member-payment"],
    queryFn: async () => {
      const {
        data: { response },
      } = await api.get("/user/member-payment");
      return response;
    },
  });
};

export const useMemberBill = () => {
  return useQuery({
    queryKey: ["member-bill"],
    queryFn: async () => {
      const {
        data: { response },
      } = await api.get("/user/member-bill");
      return response;
    },
  });
};

export const useMemberBilling = () => {
  return useQuery({
    queryKey: ["billing"],
    queryFn: async () => {
      const {
        data: { response },
      } = await api.get("/user/billing");
      return response;
    },
  });
};
