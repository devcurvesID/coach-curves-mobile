import dayjs from "dayjs";

type PdfRecord = Record<string, unknown>;

interface WeighMeasurePdfOptions {
  memberName: string;
  clubName: string;
  photoUrl?: string;
  current: PdfRecord;
  previous: PdfRecord;
}

interface MetricDefinition {
  key: string;
  label: string;
  unit?: string;
}

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const toNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

const formatValue = (value: unknown, unit = ""): string => {
  if (value === null || value === undefined || value === "") return "-";
  const number = toNumber(value);
  return `${number === undefined ? escapeHtml(value) : number.toFixed(1)}${unit}`;
};

const formatDate = (value: unknown): string => {
  if (typeof value !== "string" || !dayjs(value).isValid()) return "-";
  return dayjs(value).format("DD MMM YYYY");
};

const getDifference = (current: unknown, previous: unknown, unit = "") => {
  const currentNumber = toNumber(current);
  const previousNumber = toNumber(previous);
  if (currentNumber === undefined || previousNumber === undefined) return "-";
  const difference = currentNumber - previousNumber;
  if (difference === 0) return "Tidak berubah";
  return `${difference > 0 ? "+" : ""}${difference.toFixed(1)}${unit}`;
};

const buildMetricRows = (
  metrics: MetricDefinition[],
  current: PdfRecord,
  previous: PdfRecord,
) =>
  metrics
    .map(
      ({ key, label, unit = "" }) => `
        <tr>
          <td>${escapeHtml(label)}</td>
          <td>${formatValue(previous[key], unit)}</td>
          <td><strong>${formatValue(current[key], unit)}</strong></td>
          <td>${getDifference(current[key], previous[key], unit)}</td>
        </tr>`,
    )
    .join("");

const buildCurrentRows = (metrics: MetricDefinition[], current: PdfRecord) =>
  metrics
    .map(
      ({ key, label, unit = "" }) => `
        <tr>
          <td>${escapeHtml(label)}</td>
          <td class="value"><strong>${formatValue(current[key], unit)}</strong></td>
        </tr>`,
    )
    .join("");

export const buildWeighMeasurePdfHtml = ({
  memberName,
  clubName,
  photoUrl,
  current,
  previous,
}: WeighMeasurePdfOptions): string => {
  const compositionMetrics: MetricDefinition[] = [
    { key: "weight", label: "Berat Badan", unit: " kg" },
    { key: "bmi", label: "BMI" },
    { key: "body_fat", label: "Lemak Tubuh", unit: "%" },
    { key: "body_water", label: "Air Tubuh", unit: "%" },
    { key: "muscle_mass", label: "Massa Otot", unit: " kg" },
    { key: "bone_mass", label: "Massa Tulang", unit: " kg" },
    { key: "visceral", label: "Lemak Visceral" },
    { key: "metabolic", label: "Usia Metabolik", unit: " tahun" },
    { key: "dci", label: "DCI", unit: " kcal" },
  ];
  const bodySizeMetrics: MetricDefinition[] = [
    { key: "chest", label: "Dada", unit: " cm" },
    { key: "waist", label: "Pinggang", unit: " cm" },
    { key: "abdomen", label: "Perut", unit: " cm" },
    { key: "hip", label: "Pinggul", unit: " cm" },
    { key: "thigh", label: "Paha", unit: " cm" },
    { key: "arm", label: "Lengan", unit: " cm" },
    { key: "total_measurement", label: "Total Ukuran", unit: " cm" },
  ];
  const memberMetrics: MetricDefinition[] = [
    { key: "age", label: "Umur", unit: " tahun" },
    { key: "height", label: "Tinggi Badan", unit: " cm" },
    { key: "rhr", label: "Resting Heart Rate" },
    { key: "total_body_fat", label: "Total Body Fat", unit: "%" },
    { key: "total_hydration", label: "Total Hydration", unit: "%" },
  ];
  const activityMetrics: MetricDefinition[] = [
    { key: "total_wo_per_month", label: "Latihan per Bulan", unit: "x" },
    { key: "pro_workout", label: "Program Workout" },
    { key: "three_times_a_week", label: "3x Seminggu" },
  ];
  const initials = memberName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const profile = photoUrl
    ? `<img class="avatar" src="${escapeHtml(photoUrl)}" alt="Foto member" />`
    : `<div class="avatar fallback">${escapeHtml(initials || "M")}</div>`;

  return `<!DOCTYPE html>
  <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <style>
        @page { margin: 28px; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #1f2937; font-family: Arial, Helvetica, sans-serif; font-size: 11px; }
        .header { border-radius: 18px; padding: 22px; color: white; background: #6F3FA0; }
        .brand { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #e9d5ff; }
        .title { margin: 5px 0 0; font-size: 24px; }
        .profile { display: flex; align-items: center; margin-top: 18px; }
        .avatar { width: 58px; height: 58px; border-radius: 15px; object-fit: cover; background: #ede9fe; }
        .fallback { display: flex; align-items: center; justify-content: center; color: #6F3FA0; background: white; font-size: 20px; font-weight: 700; }
        .identity { margin-left: 14px; }
        .member-name { font-size: 18px; font-weight: 700; }
        .club { margin-top: 4px; color: #ede9fe; }
        .period { margin-top: 16px; padding: 11px 13px; border-radius: 10px; color: #5b21b6; background: #f5f3ff; font-weight: 700; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px; margin-top: 14px; }
        .summary-card { border: 1px solid #ede9fe; border-radius: 12px; padding: 12px; }
        .summary-label { min-height: 25px; color: #6b7280; font-size: 9px; text-transform: uppercase; }
        .summary-value { margin-top: 5px; color: #6F3FA0; font-size: 17px; font-weight: 700; }
        .summary-diff { margin-top: 5px; color: #6b7280; font-size: 9px; }
        .section { margin-top: 17px; break-inside: avoid; }
        .section-title { margin: 0 0 8px; color: #6F3FA0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; }
        th { padding: 9px; color: #6b7280; background: #f5f3ff; font-size: 9px; text-align: left; }
        td { padding: 9px; border-bottom: 1px solid #e5e7eb; }
        .value { text-align: right; }
        .footer { margin-top: 22px; padding-top: 10px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 9px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">CURVES - WEIGH &amp; MEASURE</div>
        <h1 class="title">Resume Hasil WM</h1>
        <div class="profile">${profile}<div class="identity"><div class="member-name">${escapeHtml(memberName)}</div><div class="club">${escapeHtml(clubName)}</div></div></div>
      </div>
      <div class="period">Periode perbandingan: ${formatDate(previous.wm_date)} ke ${formatDate(current.wm_date)}</div>
      <div class="summary">
        ${compositionMetrics
          .slice(0, 3)
          .concat(bodySizeMetrics.slice(-1))
          .map(
            ({ key, label, unit = "" }) =>
              `<div class="summary-card"><div class="summary-label">${label}</div><div class="summary-value">${formatValue(current[key], unit)}</div><div class="summary-diff">Perubahan: ${getDifference(current[key], previous[key], unit)}</div></div>`,
          )
          .join("")}
      </div>
      <div class="section"><h2 class="section-title">Komposisi Tubuh</h2><table><thead><tr><th>Pengukuran</th><th>Sebelumnya</th><th>Terkini</th><th>Perubahan</th></tr></thead><tbody>${buildMetricRows(compositionMetrics, current, previous)}</tbody></table></div>
      <div class="section"><h2 class="section-title">Ukuran Tubuh</h2><table><thead><tr><th>Pengukuran</th><th>Sebelumnya</th><th>Terkini</th><th>Perubahan</th></tr></thead><tbody>${buildMetricRows(bodySizeMetrics, current, previous)}</tbody></table></div>
      <div class="section"><h2 class="section-title">Informasi Pengukuran Terkini</h2><table><tbody>${buildCurrentRows(memberMetrics, current)}<tr><td>Tekanan Darah</td><td class="value"><strong>${formatValue(current.bp_high, "")}/${formatValue(current.bp_low, "")}</strong></td></tr></tbody></table></div>
      <div class="section"><h2 class="section-title">Aktivitas Latihan</h2><table><tbody>${buildCurrentRows(activityMetrics, current)}</tbody></table></div>
      <div class="footer">Dibuat pada ${dayjs().format("DD MMM YYYY HH:mm")} - Dokumen ini merupakan ringkasan hasil pengukuran member.</div>
    </body>
  </html>`;
};
