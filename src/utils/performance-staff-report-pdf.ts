import type {
  PerformanceStaffPrintout,
  PerformanceStaffPrintoutItem,
} from "@/hooks/usePerformanceStaffReport";

interface BuildPerformanceStaffReportPdfParams {
  clubName: string;
  generatedAt?: Date;
  printout: PerformanceStaffPrintout;
  staffName: string;
}

interface PdfMetric {
  key: keyof PerformanceStaffPrintoutItem;
  label: string;
}

const toNumber = (value: unknown): number => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const escapeHtml = (value: unknown): string =>
  String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatDate = (value: string): string => {
  const dateOnly = value.slice(0, 10);
  const [year, month, day] = dateOnly.split("-").map(Number);
  const date = new Date(year, Math.max(0, month - 1), day || 1);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const CALLING_METRICS: PdfMetric[] = [
  { key: "total_calling", label: "Total Calling" },
  { key: "answer", label: "Telepon Dijawab" },
  { key: "total_apo", label: "Total Appointment" },
  { key: "apo_confirm", label: "Appointment Confirm" },
  { key: "apo_slow_up", label: "Appointment Show Up" },
];

const LEAD_METRICS: PdfMetric[] = [
  { key: "br", label: "Business Referral" },
  { key: "total_leads", label: "Total Leads" },
  { key: "cp", label: "Community Partner" },
  { key: "flayer", label: "Brosur Dibagikan" },
  { key: "leads_gp", label: "Leads dari Brosur" },
];

const COACHING_METRICS: PdfMetric[] = [
  { key: "pcs", label: "Personal Coaching Session" },
  { key: "advance", label: "Advance Workout" },
  { key: "wm", label: "Weigh & Measure" },
  { key: "jumalah_fa", label: "Fitness Analysis" },
  { key: "jumalah_fwo", label: "First Workout" },
];

const SALES_METRICS: PdfMetric[] = [
  { key: "vip", label: "VIP / Fitness Assessment" },
  { key: "one_week_free", label: "One Week Free" },
  { key: "promo_750k", label: "Promo 750K" },
  { key: "promo", label: "Promo / Flash Sale" },
  { key: "another_promo", label: "Promo Lainnya" },
  { key: "loker", label: "Loker" },
  { key: "konversi_promo", label: "Konversi Promo" },
  { key: "konversi_regular", label: "Konversi Regular" },
  { key: "renewal", label: "Renewal" },
  { key: "product", label: "Product" },
  { key: "sales", label: "Sales" },
];

const ALL_METRICS = [
  ...CALLING_METRICS,
  ...LEAD_METRICS,
  ...COACHING_METRICS,
  ...SALES_METRICS,
];

const renderMetricGrid = (
  report: PerformanceStaffPrintoutItem,
  metrics: PdfMetric[],
): string =>
  metrics
    .map(
      ({ key, label }) => `
        <div class="metric">
          <span>${escapeHtml(label)}</span>
          <strong>${toNumber(report[key]).toLocaleString("id-ID")}</strong>
        </div>`,
    )
    .join("");

export const buildPerformanceStaffReportPdfHtml = ({
  clubName,
  generatedAt = new Date(),
  printout,
  staffName,
}: BuildPerformanceStaffReportPdfParams): string => {
  const aggregate = Object.fromEntries(
    ALL_METRICS.map(({ key }) => [
      key,
      printout.response.reduce(
        (total, report) => total + toNumber(report[key]),
        0,
      ),
    ]),
  ) as Record<string, number>;
  const generatedLabel = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(generatedAt);
  const reportCards = printout.response
    .map(
      (report, index) => `
        <section class="report-card">
          <div class="report-title">
            <div>
              <small>REPORT ${String(index + 1).padStart(2, "0")}</small>
              <h2>${escapeHtml(formatDate(report.report_date))}</h2>
            </div>
            <div class="rates">
              <div><span>Answer Rate</span><strong>${escapeHtml(report.persen_call ?? "0%")}</strong></div>
              <div><span>Show-up Rate</span><strong>${escapeHtml(report.persen_su ?? "0%")}</strong></div>
            </div>
          </div>
          <h3>Calling & Appointment</h3>
          <div class="metric-grid">${renderMetricGrid(report, CALLING_METRICS)}</div>
          <h3>Lead Generation</h3>
          <div class="metric-grid">${renderMetricGrid(report, LEAD_METRICS)}</div>
          <h3>Coaching & Member Service</h3>
          <div class="metric-grid">${renderMetricGrid(report, COACHING_METRICS)}</div>
          <h3>Promotion & Sales</h3>
          <div class="metric-grid">${renderMetricGrid(report, SALES_METRICS)}</div>
          <div class="guest-pass">
            <span>Catatan Guest Pass</span>
            <p>${escapeHtml(report.lead_guespass || "Tidak ada catatan guest pass.")}</p>
          </div>
        </section>`,
    )
    .join("");

  return `<!DOCTYPE html>
  <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        @page { size: A4; margin: 18mm 14mm 18mm; }
        * { box-sizing: border-box; }
        html, body { background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { margin: 0; color: #1e293b; font-family: Arial, Helvetica, sans-serif; font-size: 10px; line-height: 1.45; }
        .header { border-radius: 18px; padding: 22px; color: #fff; background: #6f3fa0; }
        .brand { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #e9d5ff; }
        h1 { margin: 6px 0 3px; font-size: 24px; }
        .header p { margin: 0; color: #f3e8ff; }
        .identity { display: table; width: 100%; margin-top: 14px; padding: 12px 14px; border: 1px solid #e9d5ff; border-radius: 12px; background: #faf5ff; }
        .identity > div { display: table-cell; width: 33.33%; }
        .identity span, .summary span, .metric span, .rates span, .guest-pass span { display: block; color: #64748b; font-size: 8px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase; }
        .identity strong { display: block; margin-top: 3px; font-size: 11px; color: #334155; }
        .summary { display: table; width: 100%; table-layout: fixed; margin-top: 12px; border-spacing: 7px 0; }
        .summary > div { display: table-cell; padding: 12px; border-radius: 12px; background: #f8fafc; }
        .summary strong { display: block; margin-top: 4px; font-size: 20px; color: #6f3fa0; }
        .section-heading { margin: 22px 0 10px; font-size: 16px; color: #0f172a; }
        .report-card { margin-bottom: 16px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 16px; page-break-inside: avoid; }
        .report-title { display: table; width: 100%; padding-bottom: 10px; border-bottom: 2px solid #f3e8ff; }
        .report-title > div { display: table-cell; vertical-align: middle; }
        .report-title small { color: #7c3aed; font-weight: 700; letter-spacing: 1px; }
        .report-title h2 { margin: 2px 0 0; font-size: 16px; color: #1e293b; }
        .rates { text-align: right; }
        .rates > div { display: inline-block; min-width: 76px; margin-left: 6px; padding: 7px 9px; text-align: left; border-radius: 8px; background: #ecfdf5; }
        .rates strong { display: block; margin-top: 2px; color: #047857; font-size: 13px; }
        h3 { margin: 13px 0 7px; color: #6f3fa0; font-size: 11px; }
        .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
        .metric { min-height: 48px; padding: 8px; border-radius: 8px; background: #f8fafc; }
        .metric strong { display: block; margin-top: 5px; font-size: 14px; color: #0f172a; }
        .guest-pass { margin-top: 12px; padding: 10px; border-radius: 9px; background: #fffbeb; }
        .guest-pass p { margin: 4px 0 0; white-space: pre-wrap; color: #78350f; }
        .footer { margin-top: 16px; padding-top: 10px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 8px; text-align: center; }
      </style>
    </head>
    <body>
      <header class="header">
        <div class="brand">CURVES - STAFF PERFORMANCE</div>
        <h1>Report Aktivitas Coach</h1>
        <p>Rekap aktivitas harian berdasarkan periode yang dipilih.</p>
      </header>
      <div class="identity">
        <div><span>Nama Coach</span><strong>${escapeHtml(staffName)}</strong></div>
        <div><span>Club</span><strong>${escapeHtml(clubName)}</strong></div>
        <div><span>Periode</span><strong>${escapeHtml(formatDate(printout.from_date))} - ${escapeHtml(formatDate(printout.to_date))}</strong></div>
      </div>
      <div class="summary">
        <div><span>Total Report</span><strong>${printout.total}</strong></div>
        <div><span>Total Calling</span><strong>${aggregate.total_calling ?? 0}</strong></div>
        <div><span>Telepon Dijawab</span><strong>${aggregate.answer ?? 0}</strong></div>
        <div><span>Total Leads</span><strong>${aggregate.total_leads ?? 0}</strong></div>
      </div>
      <h2 class="section-heading">Rincian Report Harian</h2>
      ${reportCards}
      <footer class="footer">Dokumen dibuat pada ${escapeHtml(generatedLabel)} - Data bersumber dari sistem Curves.</footer>
    </body>
  </html>`;
};
