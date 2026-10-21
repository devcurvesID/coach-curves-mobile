import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface PerformanceStaffReport {
  member_club_id?: string | number | null;
  report_date?: string | null;
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
  total_bayar?: number | null;
  persen_call?: string | null;
  persen_su?: string | null;
}

export interface PerformanceStaffPrintoutItem extends PerformanceStaffReport {
  _id?: string;
  id?: string;
  staff_id?: string;
  club_id?: string;
  report_date: string;
  total_apo?: number | null;
  persen_call?: string | null;
  persen_su?: string | null;
  promo?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface PerformanceStaffPrintout {
  total: number;
  response: PerformanceStaffPrintoutItem[];
  from_date: string;
  to_date: string;
}

export interface PerformanceStaffWmActivityRecord {
  _id: string;
  id?: string;
  app_hour?: string | null;
  user_id?:
    | string
    | {
        _id?: string;
        name?: string | null;
      }
    | null;
  staff_id?: string | null;
  app_date?: string | null;
  status?: boolean | string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PerformanceStaffWmActivity {
  total: number;
  response: PerformanceStaffWmActivityRecord[];
}

export interface PerformanceStaffRenewalActivityRecord {
  _id: string;
  source_id?: number | null;
  user_id?:
    | string
    | {
        _id?: string;
        name?: string | null;
      }
    | null;
  payment_number?: string | null;
  sf_amount?: number | string | null;
  mf_amount?: number | string | null;
  dc_amount?: number | string | null;
  tax_amount?: number | string | null;
  amount_due?: number | string | null;
  payment_category?: string | null;
  payment_date?: string | null;
  amount_paid?: number | string | null;
  rest_of_bill?: number | string | null;
  payment_status?: string | null;
  renewal?: boolean | null;
  conversion?: boolean | null;
  deposit_amount?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PerformanceStaffRenewalActivity {
  total: number;
  response: PerformanceStaffRenewalActivityRecord[];
}

export interface PerformanceStaffProductActivityRecord {
  _id: string;
  member_id?:
    | string
    | {
        _id?: string;
        name?: string | null;
      }
    | null;
  payment_number?: string | null;
  subtotal?: number | string | null;
  total?: number | string | null;
  tax_value?: number | string | null;
  voucher_code?: string | null;
  voucher_value?: number | string | null;
  pay?: number | string | null;
  change?: number | string | null;
  invoice_discount?: number | string | null;
  payment_date?: string | null;
  is_reward?: boolean | null;
  is_billed?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PerformanceStaffProductActivity {
  total: number;
  response: PerformanceStaffProductActivityRecord[];
}

export interface PerformanceStaffPromoConversionActivityRecord {
  _id: string;
  payment_number?: string | null;
  amount_due?: number | string | null;
  payment_date?: string | null;
  amount_paid?: number | string | null;
  rest_of_bill?: number | string | null;
  payment_status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  data_member?: {
    name?: string | null;
  } | null;
}

export interface PerformanceStaffPromoConversionActivity {
  total: number;
  response: PerformanceStaffPromoConversionActivityRecord[];
}

export interface PerformanceStaffLockerActivityRecord {
  _id: string;
  payment_number?: string | null;
  price?: number | string | null;
  quantity?: number | string | null;
  subtotal?: number | string | null;
  tax_amount?: number | string | null;
  pay?: number | string | null;
  payment_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  data_member?: {
    name?: string | null;
  } | null;
}

export interface PerformanceStaffLockerActivity {
  total: number;
  response: PerformanceStaffLockerActivityRecord[];
}

export interface PerformanceStaffSalesActivity {
  konversi_promo: number;
  konversi_regular: number;
  locker: number;
  product: number;
  renewal: number;
  total_bayar: number;
}

export type EditablePerformanceStaffReport = Omit<
  PerformanceStaffReport,
  | "member_club_id"
  | "report_date"
  | "wm"
  | "loker"
  | "konversi_promo"
  | "konversi_regular"
  | "renewal"
  | "product"
  | "sales"
  | "total_bayar"
  | "persen_call"
  | "persen_su"
>;

export interface PerformanceStaffAutomaticActivityPayload {
  wm: number;
  loker: number;
  konversi_promo: number;
  konversi_regular: number;
  renewal: number;
  product: number;
  sales: number;
  total_bayar: number;
}

export type CreatePerformanceStaffReportPayload =
  EditablePerformanceStaffReport &
    PerformanceStaffAutomaticActivityPayload & {
      member_club_id: string | number;
    };

export type UpdatePerformanceStaffReportPayload = Partial<
  EditablePerformanceStaffReport & PerformanceStaffAutomaticActivityPayload
>;

interface PerformanceStaffReportResponse {
  response?: PerformanceStaffReport | null;
}

interface PerformanceStaffPrintoutResponse {
  total?: number;
  response?: PerformanceStaffPrintoutItem[] | null;
  from_date?: string;
  to_date?: string;
}

interface PerformanceStaffWmActivityResponse {
  total?: number;
  response?: PerformanceStaffWmActivityRecord[] | null;
}

interface PerformanceStaffRenewalActivityResponse {
  total?: number;
  response?: PerformanceStaffRenewalActivityRecord[] | null;
}

interface PerformanceStaffProductActivityResponse {
  total?: number;
  response?: PerformanceStaffProductActivityRecord[] | null;
}

interface PerformanceStaffPromoConversionActivityResponse {
  total?: number;
  response?: PerformanceStaffPromoConversionActivityRecord[] | null;
}

interface PerformanceStaffLockerActivityResponse {
  total?: number;
  response?: PerformanceStaffLockerActivityRecord[] | null;
}

interface PerformanceStaffSalesActivityResponse {
  response?: Partial<PerformanceStaffSalesActivity> | null;
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

export const usePerformanceStaffPrintout = (userId?: string) =>
  useMutation({
    mutationFn: async ({
      fromDate,
      toDate,
    }: {
      fromDate: string;
      toDate: string;
    }): Promise<PerformanceStaffPrintout> => {
      if (!userId) throw new Error("Identitas pengguna belum tersedia.");

      const { data } = await api.post<PerformanceStaffPrintoutResponse>(
        `/performance-staff/print-out/${encodeURIComponent(userId)}`,
        { from_date: fromDate, to_date: toDate },
      );
      const reports = Array.isArray(data.response) ? data.response : [];

      return {
        total: Number.isFinite(Number(data.total))
          ? Number(data.total)
          : reports.length,
        response: reports,
        from_date: data.from_date ?? fromDate,
        to_date: data.to_date ?? toDate,
      };
    },
  });

export const usePerformanceStaffWmActivity = (reportDate?: string) =>
  useQuery<PerformanceStaffWmActivity>({
    queryKey: ["performance-staff", "activity", "wm", reportDate],
    enabled: Boolean(reportDate),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<PerformanceStaffWmActivityResponse>(
        `/performance-staff/activity/wm/${encodeURIComponent(reportDate!)}`,
        { signal },
      );

      const activities = Array.isArray(data.response) ? data.response : [];
      return {
        total: Number.isFinite(Number(data.total))
          ? Number(data.total)
          : activities.length,
        response: activities,
      };
    },
  });

export const usePerformanceStaffRenewalActivity = (reportDate?: string) =>
  useQuery<PerformanceStaffRenewalActivity>({
    queryKey: ["performance-staff", "activity", "renewal", reportDate],
    enabled: Boolean(reportDate),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<PerformanceStaffRenewalActivityResponse>(
        `/performance-staff/activity/renewal/${encodeURIComponent(reportDate!)}`,
        { signal },
      );
      const activities = Array.isArray(data.response) ? data.response : [];

      return {
        total: Number.isFinite(Number(data.total))
          ? Number(data.total)
          : activities.length,
        response: activities,
      };
    },
  });

export const usePerformanceStaffRegularConversionActivity = (
  reportDate?: string,
) =>
  useQuery<PerformanceStaffRenewalActivity>({
    queryKey: ["performance-staff", "activity", "konversi_regular", reportDate],
    enabled: Boolean(reportDate),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<PerformanceStaffRenewalActivityResponse>(
        `/performance-staff/activity/konversi_regular/${encodeURIComponent(reportDate!)}`,
        { signal },
      );
      const activities = Array.isArray(data.response) ? data.response : [];

      return {
        total: Number.isFinite(Number(data.total))
          ? Number(data.total)
          : activities.length,
        response: activities,
      };
    },
  });

export const usePerformanceStaffProductActivity = (reportDate?: string) =>
  useQuery<PerformanceStaffProductActivity>({
    queryKey: ["performance-staff", "activity", "product", reportDate],
    enabled: Boolean(reportDate),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<PerformanceStaffProductActivityResponse>(
        `/performance-staff/activity/product/${encodeURIComponent(reportDate!)}`,
        { signal },
      );
      const activities = Array.isArray(data.response) ? data.response : [];

      return {
        total: Number.isFinite(Number(data.total))
          ? Number(data.total)
          : activities.length,
        response: activities,
      };
    },
  });

export const usePerformanceStaffPromoConversionActivity = (
  reportDate?: string,
) =>
  useQuery<PerformanceStaffPromoConversionActivity>({
    queryKey: ["performance-staff", "activity", "konversi_promo", reportDate],
    enabled: Boolean(reportDate),
    queryFn: async ({ signal }) => {
      const { data } =
        await api.get<PerformanceStaffPromoConversionActivityResponse>(
          `/performance-staff/activity/konversi_promo/${encodeURIComponent(reportDate!)}`,
          { signal },
        );
      const activities = Array.isArray(data.response) ? data.response : [];

      return {
        total: Number.isFinite(Number(data.total))
          ? Number(data.total)
          : activities.length,
        response: activities,
      };
    },
  });

export const usePerformanceStaffLockerActivity = (reportDate?: string) =>
  useQuery<PerformanceStaffLockerActivity>({
    queryKey: ["performance-staff", "activity", "locker", reportDate],
    enabled: Boolean(reportDate),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<PerformanceStaffLockerActivityResponse>(
        `/performance-staff/activity/locker/${encodeURIComponent(reportDate!)}`,
        { signal },
      );
      const activities = Array.isArray(data.response) ? data.response : [];

      return {
        total: Number.isFinite(Number(data.total))
          ? Number(data.total)
          : activities.length,
        response: activities,
      };
    },
  });

export const usePerformanceStaffSalesActivity = (reportDate?: string) =>
  useQuery<PerformanceStaffSalesActivity | null>({
    queryKey: ["performance-staff", "activity", "sales", reportDate],
    enabled: Boolean(reportDate),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<PerformanceStaffSalesActivityResponse>(
        `/performance-staff/activity/sales/${encodeURIComponent(reportDate!)}`,
        { signal },
      );

      if (
        !data.response ||
        typeof data.response !== "object" ||
        Array.isArray(data.response)
      ) {
        return null;
      }

      const salesFields: (keyof PerformanceStaffSalesActivity)[] = [
        "konversi_promo",
        "konversi_regular",
        "locker",
        "product",
        "renewal",
        "total_bayar",
      ];
      const hasSalesData = salesFields.some(
        (field) =>
          data.response?.[field] !== null &&
          data.response?.[field] !== undefined,
      );
      if (!hasSalesData) return null;

      const toNumber = (value: unknown): number => {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
      };

      return {
        konversi_promo: toNumber(data.response.konversi_promo),
        konversi_regular: toNumber(data.response.konversi_regular),
        locker: toNumber(data.response.locker),
        product: toNumber(data.response.product),
        renewal: toNumber(data.response.renewal),
        total_bayar: toNumber(data.response.total_bayar),
      };
    },
  });
