import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface PerformanceStaffReport {
  member_club_id?: string | number | null;
  total_calling: number;
  answer: number;
  apo_confirm: number;
  apo_slow_up: number;
  br: number;
  lead_guespass: string;
  pcs: number;
  advance: number;
  cp: number;
  flayer: number;
  jumalah_fa: number;
  jumalah_fwo: number;
  vip: number;
  one_week_free: number;
  promo_750k: number;
  another_promo: number;
  leads_gp: number;
  total_leads: number;
  wm?: number | null;
  loker?: number | null;
  konversi_promo?: number | null;
  konversi_regular?: number | null;
  renewal?: number | null;
  product?: number | null;
  sales?: number | null;
}

export type EditablePerformanceStaffReport = Omit<
  PerformanceStaffReport,
  | "member_club_id"
  | "wm"
  | "loker"
  | "konversi_promo"
  | "konversi_regular"
  | "renewal"
  | "product"
  | "sales"
>;

export type CreatePerformanceStaffReportPayload =
  EditablePerformanceStaffReport & { member_club_id: string | number };

export type UpdatePerformanceStaffReportPayload =
  Partial<EditablePerformanceStaffReport>;

interface PerformanceStaffReportResponse {
  response?: PerformanceStaffReport | null;
}

const REPORT_QUERY_KEY = "performance-staff-report";

export const usePerformanceStaffReport = (reportDate: string) =>
  useQuery<PerformanceStaffReport | null>({
    queryKey: [REPORT_QUERY_KEY, reportDate],
    enabled: Boolean(reportDate),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<PerformanceStaffReportResponse>(
        `/performance-staff/report/${encodeURIComponent(reportDate)}`,
        { signal },
      );
      return data.response ?? null;
    },
  });

const useInvalidatePerformanceStaffReport = (reportDate: string) => {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: [REPORT_QUERY_KEY, reportDate],
    });
  };
};

export const useCreatePerformanceStaffReport = (reportDate: string) => {
  const invalidateReport = useInvalidatePerformanceStaffReport(reportDate);

  return useMutation({
    mutationFn: async (payload: CreatePerformanceStaffReportPayload) => {
      const { data } = await api.post<PerformanceStaffReportResponse>(
        `/performance-staff/report/${encodeURIComponent(reportDate)}`,
        payload,
      );
      return data.response ?? null;
    },
    onSuccess: invalidateReport,
  });
};

export const useUpdatePerformanceStaffReport = (reportDate: string) => {
  const invalidateReport = useInvalidatePerformanceStaffReport(reportDate);

  return useMutation({
    mutationFn: async (payload: UpdatePerformanceStaffReportPayload) => {
      const { data } = await api.patch<PerformanceStaffReportResponse>(
        `/performance-staff/report/${encodeURIComponent(reportDate)}`,
        payload,
      );
      return data.response ?? null;
    },
    onSuccess: invalidateReport,
  });
};
