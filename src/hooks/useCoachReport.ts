import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface CoachActivityReport {
  reportDate: string;
  memberWeighMeasure: number;
  lockerPayments: number;
  membershipPayments: number;
  promoPayments: number;
  conversionPayments: number;
  membershipRenewals: number;
  productPayments: number;
  membershipExtensions: number;
}

interface CoachActivityReportApiData {
  report_date?: string;
  member_wm?: number | string | null;
  pembayaran_loker?: number | string | null;
  pembayaran_keanggotaan?: number | string | null;
  pembayaran_promo?: number | string | null;
  pembayaran_konversi?: number | string | null;
  pembaharuan_keanggotaan?: number | string | null;
  pembayaran_product?: number | string | null;
  perpanjangan_keanggotaan?: number | string | null;
}

interface CoachActivityReportResponse extends CoachActivityReportApiData {
  response?: CoachActivityReportApiData | null;
}

const toCount = (value: number | string | null | undefined): number => {
  const count = Number(value);
  return Number.isFinite(count) ? count : 0;
};

export const useCoachActivityReport = (reportDate: string) =>
  useQuery<CoachActivityReport | null>({
    queryKey: ["coach-activity-report", reportDate],
    enabled: Boolean(reportDate),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<CoachActivityReportResponse>(
        `/coachs/report-staff/${encodeURIComponent(reportDate)}`,
        { signal },
      );
      const report = data.response === undefined ? data : data.response;

      if (!report) return null;

      return {
        reportDate: report.report_date ?? reportDate,
        memberWeighMeasure: toCount(report.member_wm),
        lockerPayments: toCount(report.pembayaran_loker),
        membershipPayments: toCount(report.pembayaran_keanggotaan),
        promoPayments: toCount(report.pembayaran_promo),
        conversionPayments: toCount(report.pembayaran_konversi),
        membershipRenewals: toCount(report.pembaharuan_keanggotaan),
        productPayments: toCount(report.pembayaran_product),
        membershipExtensions: toCount(report.perpanjangan_keanggotaan),
      };
    },
  });
