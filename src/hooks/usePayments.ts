import { api } from "@/lib/axios";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

export interface ClubPayment {
  _id?: string;
  user_id?: string | null;
  user?: { name?: string | null } | null;
  payment_number?: string | null;
  payment_category?: string | null;
  payment_status?: string | null;
  payment_date?: string | null;
  amount_due?: string | number | null;
  amount_paid?: string | number | null;
  rest_of_bill?: string | number | null;
}

interface ClubPaymentPage {
  total?: number;
  response: ClubPayment[] | null;
}

export const useClubMemberPayments = (clubId?: string) => {
  const limit = 20;
  return useInfiniteQuery({
    queryKey: ["club-member-payments", clubId],
    enabled: Boolean(clubId),
    staleTime: 60 * 1000,
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }) => {
      const { data } = await api.get<ClubPaymentPage>("/member-payment", {
        params: { club_id: clubId, offset: pageParam, limit },
        signal,
      });
      if (data.response != null && !Array.isArray(data.response)) {
        throw new Error("Format daftar tagihan tidak sesuai");
      }
      return { ...data, response: data.response ?? [] };
    },
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce(
        (count, page) => count + page.response.length,
        0,
      );
      if (lastPage.response.length === 0) return undefined;
      return lastPage.total !== undefined
        ? loaded < lastPage.total
          ? loaded
          : undefined
        : lastPage.response.length === limit
          ? loaded
          : undefined;
    },
  });
};

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
