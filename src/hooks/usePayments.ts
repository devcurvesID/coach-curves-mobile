import { api } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";

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

export const useMemberOfBillPaymentByStaffId = () => {
  return useMutation({
    mutationFn: async (coach_id: string) => {
      const { data } = await api.get(
        `/coach-member/member-payment/${coach_id}`,
      );
      return data;
    },
  });
};

export const useMemberBillingByUserId = () => {
  return useMutation({
    mutationFn: async (user_id: string) => {
      const { data } = await api.get(`/member-payment/billing/${user_id}`);
      return data.response;
    },
  });
};

export const useDetailMemberBillingByUserId = () => {
  return useMutation({
    mutationFn: async (user_id: string) => {
      const { data } = await api.get(
        `/member-payment/detail-billing/${user_id}`,
      );
      return data.response;
    },
  });
};

export const useMemberBillByUserId = (userId?: string) => {
  return useQuery({
    queryKey: ["member-bill", "user", userId],
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await api.get(
        `/member-payment/bill/${encodeURIComponent(userId ?? "")}`,
      );
      return data.response;
    },
  });
};
