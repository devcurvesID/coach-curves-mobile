import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface StaffPerformancePoint {
  id: number | string;
  acquire_date: string;
  amount: number;
  user_id: number | string;
  point_id: number | string;
  created_at?: string | null;
  updated_at?: string | null;
  point_name: string;
  point_type?: string | null;
  point_type_detail?: string | null;
}

interface StaffPerformanceApiResponse {
  response?: StaffPerformancePoint | StaffPerformancePoint[] | null;
}

export const useStaffPerformancePoints = (
  userId?: string,
  acquireDate?: string,
) =>
  useQuery<StaffPerformancePoint[]>({
    queryKey: ["performance-staff", "lspa", userId, acquireDate],
    enabled: Boolean(userId && acquireDate),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<StaffPerformanceApiResponse>(
        `/performance-staff/lspa/${encodeURIComponent(userId!)}`,
        {
          params: { acquire_date: acquireDate },
          signal,
        },
      );

      if (!data.response) return [];
      return Array.isArray(data.response) ? data.response : [data.response];
    },
  });
